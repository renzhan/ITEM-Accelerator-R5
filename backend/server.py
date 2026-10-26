#!/usr/bin/env python3
"""Local reference API for ISS-R5 collection; standard library only."""
import csv
import datetime as dt
import io
import json
import os
import re
import secrets
import sqlite3
import tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

MAX_BYTES = 50 * 1024
MAX_FIELD = 5000
SHORT_200 = {'department', 'person', 'owner', 'initiator', 'decisionMaker', 'deadline', 'status'}
SHORT_500 = {'topic', 'pain', 'currentState', 'baseline', 'breakpoints'}
SCHEMAS = {
    'prework': {'required': ['department', 'person', 'topic', 'pain', 'currentState', 'inputMaterials', 'desiredPractice', 'baseline', 'breakpoints', 'owner'], 'optional': ['materialLinks']},
    'convergence': {'required': ['topic', 'prioritizedScenario', 'coreCapabilities', 'coBuildMode', 'initiator', 'participants', 'decisionMaker', 'risks'], 'optional': ['acceptance', 'inputsAndBoundary', 'nextGate', 'owner', 'deadline', 'status', 'leaderViews']},
}


def field_limit(key):
    return 200 if key in SHORT_200 else 500 if key in SHORT_500 else MAX_FIELD


def byte_len(value):
    return len(value.encode('utf-8'))


def validate(payload):
    if not isinstance(payload, dict): return 'invalid_json_shape'
    kind = payload.get('kind')
    if kind not in SCHEMAS: return 'unknown_kind'
    if not isinstance(payload.get('recordId'), str) or not re.fullmatch(r'[A-Za-z0-9._:-]{1,128}', payload['recordId']): return 'invalid_metadata'
    if payload.get('workshop') != 'ISS-R5' or payload.get('consent') is not True: return 'invalid_metadata'
    fields = payload.get('fields')
    if not isinstance(fields, dict): return 'invalid_fields'
    schema = SCHEMAS[kind]
    allowed = set(schema['required'] + schema['optional'])
    for key, value in fields.items():
        if key not in allowed or not isinstance(value, str) or byte_len(value) > field_limit(key): return 'invalid_field'
    if any(not fields.get(key) for key in schema['required']): return 'missing_required_field'
    return ''


def csv_safe(value):
    text = '' if value is None else str(value)
    if re.match(r'^[\t\r ]*[=+\-@]', text): text = "'" + text
    return text


def make_csv(rows):
    out = io.StringIO(newline='')
    writer = csv.writer(out, lineterminator='\r\n')
    for row in rows: writer.writerow([csv_safe(value) for value in row])
    return out.getvalue()


def default_db():
    root = Path(os.environ.get('ISS_USER_DATA_DIR', Path(tempfile.gettempdir()) / 'iss-r5-collection'))
    root.mkdir(parents=True, exist_ok=True)
    return root / 'submissions.sqlite3'


SCHEMA_SQL = '''CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('prework', 'convergence')),
  record_id TEXT NOT NULL UNIQUE,
  workshop TEXT NOT NULL CHECK (workshop = 'ISS-R5'),
  fields_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_kind ON submissions(kind);'''


class App(BaseHTTPRequestHandler):
    server_version = 'ISS-R5-Collection/1.0'

    def db(self): return self.server.db_path
    def cors_headers(self):
        origin = self.headers.get('Origin')
        allowed = {item.strip() for item in os.environ.get('ALLOWED_ORIGINS', '').split(',') if item.strip() and item.strip() != '*'}
        if origin and origin not in allowed: return None
        return {'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Vary': 'Origin'} if origin else {}

    def send_json(self, status, payload, headers=None):
        data = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        for key, value in (headers or {}).items(): self.send_header(key, value)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers(); self.wfile.write(data)

    def do_OPTIONS(self):
        if self.path.split('?', 1)[0] not in ('/api/submissions', '/api/submissions.json', '/api/submissions.csv'):
            self.send_error(404); return
        headers = self.cors_headers()
        if headers is None: self.send_json(403, {'ok': False, 'error': 'origin_not_allowed'}); return
        self.send_response(204)
        for key, value in headers.items(): self.send_header(key, value)
        self.send_header('Access-Control-Max-Age', '600'); self.end_headers()

    def do_POST(self):
        headers = self.cors_headers()
        if self.path.split('?', 1)[0] != '/api/submissions': self.send_error(404); return
        if headers is None: self.send_json(403, {'ok': False, 'error': 'origin_not_allowed'}); return
        length = int(self.headers.get('Content-Length', '0') or 0)
        if length > MAX_BYTES: self.send_json(413, {'ok': False, 'error': 'payload_too_large'}, headers); return
        raw = self.rfile.read(min(length, MAX_BYTES + 1))
        if len(raw) > MAX_BYTES: self.send_json(413, {'ok': False, 'error': 'payload_too_large'}, headers); return
        try: payload = json.loads(raw.decode('utf-8'))
        except (ValueError, UnicodeDecodeError): self.send_json(400, {'ok': False, 'error': 'invalid_json'}, headers); return
        issue = validate(payload)
        if issue: self.send_json(400 if issue == 'unknown_kind' else 422, {'ok': False, 'error': issue}, headers); return
        created = dt.datetime.now(dt.timezone.utc).isoformat().replace('+00:00', 'Z')
        identifier = secrets.token_hex(16)
        with sqlite3.connect(self.db()) as conn:
            conn.executescript(SCHEMA_SQL)
            cur = conn.execute('INSERT OR IGNORE INTO submissions (id, kind, record_id, workshop, fields_json, created_at) VALUES (?, ?, ?, ?, ?, ?)', (identifier, payload['kind'], payload['recordId'], payload['workshop'], json.dumps(payload['fields'], ensure_ascii=False), created))
            row = conn.execute('SELECT id, created_at FROM submissions WHERE record_id = ?', (payload['recordId'],)).fetchone()
        self.send_json(201 if cur.rowcount == 1 else 200, {'ok': True, 'id': row[0], 'createdAt': row[1]}, headers)

    def authorized(self):
        expected = os.environ.get('ADMIN_TOKEN', '')
        actual = self.headers.get('Authorization', '')
        return bool(expected) and secrets.compare_digest(actual, 'Bearer ' + expected)

    def do_GET(self):
        path, _, query = self.path.partition('?')
        if path not in ('/api/submissions', '/api/submissions.json', '/api/submissions.csv'):
            self.send_error(404); return
        headers = self.cors_headers()
        if headers is None: self.send_json(403, {'ok': False, 'error': 'origin_not_allowed'}); return
        if not self.authorized(): self.send_json(401, {'ok': False, 'error': 'unauthorized'}, headers); return
        with sqlite3.connect(self.db()) as conn:
            conn.executescript(SCHEMA_SQL)
            rows = conn.execute('SELECT id, kind, record_id, workshop, fields_json, created_at FROM submissions ORDER BY created_at ASC').fetchall()
        fmt = parse_qs(query).get('format', ['json'])[0]
        if path.endswith('.csv') or fmt == 'csv':
            output = [['id', 'kind', 'recordId', 'workshop', 'createdAt', 'field', 'value']]
            for identifier, kind, record_id, workshop, fields_json, created_at in rows:
                for key, value in json.loads(fields_json).items(): output.append([identifier, kind, record_id, workshop, created_at, key, value])
            data = make_csv(output).encode()
            self.send_response(200)
            for key, value in headers.items(): self.send_header(key, value)
            self.send_header('Content-Type', 'text/csv; charset=utf-8'); self.send_header('Content-Disposition', 'attachment; filename="iss-r5-submissions.csv"'); self.send_header('Cache-Control', 'no-store'); self.send_header('Content-Length', str(len(data))); self.end_headers(); self.wfile.write(data); return
        submissions = [{'id': row[0], 'kind': row[1], 'recordId': row[2], 'workshop': row[3], 'fields': json.loads(row[4]), 'createdAt': row[5]} for row in rows]
        self.send_json(200, {'ok': True, 'submissions': submissions}, headers)

    def log_message(self, fmt, *args): pass


def serve(host='127.0.0.1', port=8787, db_path=None):
    path = Path(db_path or os.environ.get('ISS_DB_PATH', default_db()))
    path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(path) as conn: conn.executescript(SCHEMA_SQL)
    server = ThreadingHTTPServer((host, port), App); server.db_path = str(path)
    print(f'ISS-R5 local API listening on http://{host}:{server.server_address[1]}', flush=True)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()


if __name__ == '__main__':
    serve(os.environ.get('ISS_HOST', '127.0.0.1'), int(os.environ.get('ISS_PORT', '8787')))
