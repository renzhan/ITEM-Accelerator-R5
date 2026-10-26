const MAX_BYTES = 50 * 1024;
const MAX_FIELD = 5000;
const SHORT_200 = new Set(['department', 'person', 'owner', 'initiator', 'decisionMaker', 'deadline', 'status']);
const SHORT_500 = new Set(['topic', 'pain', 'currentState', 'baseline', 'breakpoints']);
const SCHEMAS = {
  prework: { required: ['department', 'person', 'topic', 'pain', 'currentState', 'inputMaterials', 'desiredPractice', 'baseline', 'breakpoints', 'owner'], optional: ['materialLinks'] },
  convergence: { required: ['topic', 'prioritizedScenario', 'coreCapabilities', 'coBuildMode', 'initiator', 'participants', 'decisionMaker', 'risks'], optional: ['acceptance', 'inputsAndBoundary', 'nextGate', 'owner', 'deadline', 'status', 'leaderViews'] }
};

function allowedOrigins(env) {
  return new Set(String(env.ALLOWED_ORIGINS || '').split(',').map((item) => item.trim()).filter((item) => item && item !== '*'));
}

function cors(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return { ok: true, headers: {} };
  if (!allowedOrigins(env).has(origin)) return { ok: false, headers: {} };
  return { ok: true, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Vary': 'Origin' } };
}

function response(body, status, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });
}
function error(message, status, headers) { return response({ ok: false, error: message }, status, headers); }
function limitFor(key) { return SHORT_200.has(key) ? 200 : (SHORT_500.has(key) ? 500 : MAX_FIELD); }
function textBytes(value) { return new TextEncoder().encode(value).byteLength; }
function validRecordId(value) { return typeof value === 'string' && /^[A-Za-z0-9._:-]{1,128}$/.test(value); }
function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return 'invalid_json_shape';
  if (!SCHEMAS[payload.kind]) return 'unknown_kind';
  if (!validRecordId(payload.recordId) || payload.workshop !== 'ISS-R5' || payload.consent !== true) return 'invalid_metadata';
  if (!payload.fields || typeof payload.fields !== 'object' || Array.isArray(payload.fields)) return 'invalid_fields';
  const schema = SCHEMAS[payload.kind];
  const allowed = new Set([...schema.required, ...schema.optional]);
  for (const [key, value] of Object.entries(payload.fields)) {
    if (!allowed.has(key) || typeof value !== 'string' || textBytes(value) > limitFor(key)) return 'invalid_field';
  }
  for (const key of schema.required) if (!payload.fields[key]) return 'missing_required_field';
  return '';
}
function csvCell(value) {
  let text = value == null ? '' : String(value);
  if (/^[\t\r ]*[=+\-@]/.test(text)) text = "'" + text;
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}
function csv(rows) { return rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n'; }
function authOk(request, env) {
  const expected = String(env.ADMIN_TOKEN || '');
  const actual = request.headers.get('Authorization') || '';
  return constantTimeEqual(actual, expected ? `Bearer ${expected}` : '');
}
function constantTimeEqual(a, b) {
  const left = new TextEncoder().encode(String(a));
  const right = new TextEncoder().encode(String(b));
  const length = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let i = 0; i < length; i += 1) diff |= (left[i] || 0) ^ (right[i] || 0);
  return diff === 0;
}
function routePath(request) { return new URL(request.url).pathname; }
function isApiPath(path) { return path === '/api/submissions' || path === '/api/submissions.json' || path === '/api/submissions.csv'; }

async function postSubmission(request, env, headers) {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > MAX_BYTES) return error('payload_too_large', 413, headers);
  const buffer = await request.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) return error('payload_too_large', 413, headers);
  let payload;
  try { payload = JSON.parse(new TextDecoder().decode(buffer)); } catch (_) { return error('invalid_json', 400, headers); }
  const issue = validatePayload(payload);
  if (issue) return error(issue, issue === 'unknown_kind' ? 400 : 422, headers);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const inserted = await env.DB.prepare('INSERT OR IGNORE INTO submissions (id, kind, record_id, workshop, fields_json, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, payload.kind, payload.recordId, payload.workshop, JSON.stringify(payload.fields), createdAt).run();
  const row = await env.DB.prepare('SELECT id, created_at FROM submissions WHERE record_id = ?').bind(payload.recordId).first();
  if (!row) return error('persistence_failed', 500, headers);
  return response({ ok: true, id: row.id, createdAt: row.created_at }, inserted.meta && inserted.meta.changes ? 201 : 200, headers);
}

async function getSubmissions(request, env, headers) {
  if (!String(env.ADMIN_TOKEN || '') || !authOk(request, env)) return error('unauthorized', 401, headers);
  const url = new URL(request.url);
  const format = url.pathname.endsWith('.csv') || url.searchParams.get('format') === 'csv' ? 'csv' : 'json';
  const result = await env.DB.prepare('SELECT id, kind, record_id, workshop, fields_json, created_at FROM submissions ORDER BY created_at ASC').all();
  const rows = result.results || [];
  if (format === 'csv') {
    const out = [['id', 'kind', 'recordId', 'workshop', 'createdAt', 'field', 'value']];
    for (const row of rows) {
      let fields = {}; try { fields = JSON.parse(row.fields_json); } catch (_) { /* keep empty */ }
      for (const [key, value] of Object.entries(fields)) out.push([row.id, row.kind, row.record_id, row.workshop, row.created_at, key, value]);
    }
    return new Response(csv(out), { status: 200, headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="iss-r5-submissions.csv"', 'Cache-Control': 'no-store' } });
  }
  return response({ ok: true, submissions: rows.map((row) => ({ id: row.id, kind: row.kind, recordId: row.record_id, workshop: row.workshop, fields: JSON.parse(row.fields_json), createdAt: row.created_at })) }, 200, headers);
}

export default {
  async fetch(request, env) {
    const path = routePath(request);
    if (!isApiPath(path)) return new Response('Not found', { status: 404 });
    const access = cors(request, env);
    if (!access.ok) return error('origin_not_allowed', 403, {});
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...access.headers, 'Access-Control-Max-Age': '600' } });
    try {
      if (request.method === 'POST' && path === '/api/submissions') return await postSubmission(request, env, access.headers);
      if (request.method === 'GET') return await getSubmissions(request, env, access.headers);
      return error('method_not_allowed', 405, access.headers);
    } catch (err) {
      return error('server_error', 500, access.headers);
    }
  }
};
