#!/usr/bin/env python3
import json
import os
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import server


class CollectionApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(prefix='iss-r5-test-')
        cls.db = str(Path(cls.tmp.name) / 'test.sqlite3')
        os.environ['ADMIN_TOKEN'] = 'test-admin-token'
        os.environ['ALLOWED_ORIGINS'] = 'http://allowed.test'
        cls.httpd = ThreadingHTTPServer(('127.0.0.1', 0), server.App)
        cls.httpd.db_path = cls.db
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True); cls.thread.start()
        cls.base = f'http://127.0.0.1:{cls.httpd.server_address[1]}'

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown(); cls.thread.join(timeout=2); cls.httpd.server_close(); cls.tmp.cleanup()
        os.environ.pop('ADMIN_TOKEN', None); os.environ.pop('ALLOWED_ORIGINS', None)

    def request(self, method, path, payload=None, headers=None):
        data = None if payload is None else json.dumps(payload, ensure_ascii=False).encode()
        req = urllib.request.Request(self.base + path, data=data, method=method, headers={'Content-Type': 'application/json', **(headers or {})})
        try:
            with urllib.request.urlopen(req, timeout=3) as res: return res.status, dict(res.headers), res.read()
        except urllib.error.HTTPError as err: return err.code, dict(err.headers), err.read()

    def setUp(self):
        with __import__('sqlite3').connect(self.db) as conn:
            conn.executescript(server.SCHEMA_SQL)
            conn.execute('DELETE FROM submissions')

    def payload(self, record='record-1', topic='safe topic'):
        return {'kind': 'prework', 'recordId': record, 'workshop': 'ISS-R5', 'consent': True, 'fields': {
            'department': 'Ops', 'person': 'A', 'topic': topic, 'pain': 'pain', 'currentState': 'state', 'inputMaterials': 'inputs', 'desiredPractice': 'practice', 'baseline': 'TBD', 'breakpoints': 'none', 'owner': 'Owner'}}

    def test_save_read_and_idempotency(self):
        status, _, body = self.request('POST', '/api/submissions', self.payload())
        self.assertEqual(status, 201); first = json.loads(body); self.assertTrue(first['ok'])
        status, _, body = self.request('POST', '/api/submissions', self.payload())
        self.assertEqual(status, 200); self.assertEqual(json.loads(body)['id'], first['id'])
        status, _, body = self.request('GET', '/api/submissions', headers={'Authorization': 'Bearer test-admin-token'})
        self.assertEqual(status, 200); self.assertEqual(len(json.loads(body)['submissions']), 1)

    def test_validation_and_unauthorized_get(self):
        bad = self.payload(record='record-2'); bad['kind'] = 'unknown'
        self.assertEqual(self.request('POST', '/api/submissions', bad)[0], 400)
        bad = self.payload(record='record-3'); bad['consent'] = False
        self.assertEqual(self.request('POST', '/api/submissions', bad)[0], 422)
        self.assertEqual(self.request('GET', '/api/submissions')[0], 401)

    def test_cors_rejection(self):
        self.assertEqual(self.request('GET', '/api/submissions', headers={'Origin': 'http://evil.test', 'Authorization': 'Bearer test-admin-token'})[0], 403)
        self.assertEqual(self.request('POST', '/api/submissions', self.payload(record='record-4'), headers={'Origin': 'http://evil.test'})[0], 403)

    def test_csv_formula_injection_is_neutralized(self):
        status, _, _ = self.request('POST', '/api/submissions', self.payload(record='record-5', topic='=1+1'))
        self.assertEqual(status, 201)
        status, headers, body = self.request('GET', '/api/submissions.csv', headers={'Authorization': 'Bearer test-admin-token'})
        self.assertEqual(status, 200); self.assertIn('text/csv', headers.get('Content-Type', ''))
        self.assertIn(b"'=1+1", body); self.assertNotIn(b',=1+1', body)


if __name__ == '__main__':
    unittest.main(verbosity=2)
