/* ISS-R5 collection: local-first, dependency-free form controller. */
(function (global) {
  'use strict';

  var MAX_JSON_BYTES = 50 * 1024;
  var MAX_FIELD = 5000;
  var SHORT_200 = ['department', 'person', 'owner', 'initiator', 'decisionMaker', 'deadline', 'status'];
  var SHORT_500 = ['topic', 'pain', 'currentState', 'baseline', 'breakpoints'];
  var SCHEMAS = {
    prework: {
      required: ['department', 'person', 'topic', 'pain', 'currentState', 'inputMaterials', 'desiredPractice', 'baseline', 'breakpoints', 'owner'],
      optional: ['materialLinks']
    },
    convergence: {
      required: ['topic', 'prioritizedScenario', 'coreCapabilities', 'coBuildMode', 'initiator', 'participants', 'decisionMaker', 'risks'],
      optional: ['acceptance', 'inputsAndBoundary', 'nextGate', 'owner', 'deadline', 'status', 'leaderViews']
    }
  };
  var STORAGE = {
    draft: 'iss-r5.collection.draft.',
    records: 'iss-r5.collection.records'
  };

  function bytes(value) {
    return new TextEncoder().encode(value).length;
  }

  function newId() {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') return global.crypto.randomUUID();
    return 'iss-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2);
  }

  function getConfig() {
    return global.ISS_CONFIG || {};
  }

  function safeJsonParse(value) {
    try { return JSON.parse(value); } catch (e) { return null; }
  }

  function storageGet(key, fallback) {
    try { var result = global.localStorage.getItem(key); return result ? (safeJsonParse(result) || fallback) : fallback; } catch (e) { return fallback; }
  }

  function storageSet(key, value) {
    try { global.localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  function escapeCsv(value) {
    var text = value == null ? '' : String(value);
    if (/^[\t\r ]*[=+\-@]/.test(text)) text = "'" + text;
    return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function download(name, content, type) {
    var blob = new Blob([content], { type: type || 'application/octet-stream' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function message(controller, zh, en, kind) {
    controller.notice.textContent = '';
    var zhNode = document.createElement('span');
    zhNode.className = 'lang-zh';
    zhNode.textContent = String(zh == null ? '' : zh);
    var enNode = document.createElement('span');
    enNode.className = 'lang-en';
    enNode.textContent = String(en == null ? '' : en);
    controller.notice.appendChild(zhNode);
    controller.notice.appendChild(enNode);
    controller.notice.className = 'collection-notice ' + (kind || 'info');
    controller.notice.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  }

  function fieldLimit(key) {
    if (SHORT_200.indexOf(key) >= 0) return 200;
    if (SHORT_500.indexOf(key) >= 0) return 500;
    return MAX_FIELD;
  }

  function collectFields(form, kind) {
    var fields = {};
    var schema = SCHEMAS[kind];
    var controls = form.querySelectorAll('[data-field]');
    for (var i = 0; i < controls.length; i += 1) {
      var control = controls[i];
      var key = control.getAttribute('data-field');
      if (schema.required.indexOf(key) < 0 && schema.optional.indexOf(key) < 0) continue;
      fields[key] = String(control.value || '').trim();
    }
    return fields;
  }

  function copyFields(fields) {
    var copy = {};
    Object.keys(fields || {}).forEach(function (key) { copy[key] = String(fields[key] == null ? '' : fields[key]); });
    return copy;
  }

  function snapshotValue(fields, consent) {
    return JSON.stringify({ fields: copyFields(fields), consent: consent === true });
  }

  function captureSnapshot(controller) {
    var fields = collectFields(controller.form, controller.kind);
    var consent = controller.consent.checked === true;
    return { recordId: controller.recordId, fields: copyFields(fields), consent: consent, value: snapshotValue(fields, consent) };
  }

  function validateSubmission(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return '数据格式不正确 / Invalid data format';
    if (payload.kind !== 'prework' && payload.kind !== 'convergence') return '表单类型不正确 / Invalid form kind';
    if (typeof payload.recordId !== 'string' || !payload.recordId || payload.recordId.length > 128) return '记录编号不正确 / Invalid record ID';
    if (payload.workshop !== 'ISS-R5') return '工作坊标识不正确 / Invalid workshop';
    if (payload.consent !== true) return '请先同意隐私说明 / Please accept the privacy notice';
    if (!payload.fields || typeof payload.fields !== 'object' || Array.isArray(payload.fields)) return '字段格式不正确 / Invalid fields';
    var schema = SCHEMAS[payload.kind];
    var allowed = schema.required.concat(schema.optional);
    var keys = Object.keys(payload.fields);
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (allowed.indexOf(key) < 0 || typeof payload.fields[key] !== 'string' || bytes(payload.fields[key]) > fieldLimit(key)) return '字段超出限制 / A field exceeds its limit';
    }
    for (var j = 0; j < schema.required.length; j += 1) {
      var requiredKey = schema.required[j];
      if (!payload.fields[requiredKey]) return '请填写全部必填项 / Please complete all required fields';
    }
    if (bytes(JSON.stringify(payload)) > MAX_JSON_BYTES) return '提交内容超过 50KB / Submission exceeds 50KB';
    return '';
  }

  function recordSnapshot(controller) {
    var snapshot = captureSnapshot(controller);
    return snapshot.value;
  }

  function loadDraft(controller) {
    var draft = storageGet(STORAGE.draft + controller.kind, null);
    if (!draft || !draft.fields) return;
    var keys = Object.keys(draft.fields);
    for (var i = 0; i < keys.length; i += 1) {
      var control = controller.form.querySelector('[data-field="' + CSS.escape(keys[i]) + '"]');
      if (control) control.value = String(draft.fields[keys[i]] || '');
    }
    controller.consent.checked = draft.consent === true;
    controller.recordId = typeof draft.recordId === 'string' && draft.recordId ? draft.recordId : newId();
    controller.lastSubmittedSnapshot = draft.lastSubmittedSnapshot || '';
    controller.lastSubmittedRecordId = typeof draft.lastSubmittedRecordId === 'string' ? draft.lastSubmittedRecordId : (draft.submittedId || '');
    controller.lastAttemptedSnapshot = draft.lastAttemptedSnapshot || '';
    controller.lastAttemptedRecordId = typeof draft.lastAttemptedRecordId === 'string' ? draft.lastAttemptedRecordId : '';
    controller.submittedId = typeof draft.submittedId === 'string' ? draft.submittedId : '';
    controller.lastReceiptId = typeof draft.lastReceiptId === 'string' ? draft.lastReceiptId : controller.submittedId;
    if (controller.submittedId && controller.lastSubmittedSnapshot && recordSnapshot(controller) !== controller.lastSubmittedSnapshot) {
      var oldReceiptId = controller.submittedId;
      controller.recordId = newId();
      controller.submittedId = '';
      controller.lastSubmittedSnapshot = '';
      controller.lastSubmittedRecordId = '';
      controller.lastReceiptId = oldReceiptId;
      message(controller, '上次回执对应旧内容：' + oldReceiptId + '；当前草稿已有修改，尚未提交。', 'The previous receipt ' + oldReceiptId + ' is for older content; the current draft has unsubmitted changes.', 'warning');
    } else if (controller.submittedId) {
      message(controller, '本机已保存上次成功回执：' + controller.submittedId + '。如修改内容，将生成新记录编号。', 'The last successful receipt is saved locally: ' + controller.submittedId + '. Editing will create a new record ID.', 'success');
    }
  }

  function saveDraft(controller) {
    var draft = {
      kind: controller.kind,
      fields: collectFields(controller.form, controller.kind),
      consent: controller.consent.checked,
      recordId: controller.recordId,
      lastSubmittedSnapshot: controller.lastSubmittedSnapshot || '',
      lastSubmittedRecordId: controller.lastSubmittedRecordId || '',
      lastAttemptedSnapshot: controller.lastAttemptedSnapshot || '',
      lastAttemptedRecordId: controller.lastAttemptedRecordId || '',
      submittedId: controller.submittedId || '',
      lastReceiptId: controller.lastReceiptId || ''
    };
    storageSet(STORAGE.draft + controller.kind, draft);
  }

  function records() { return storageGet(STORAGE.records, []); }
  function saveRecords(items) { return storageSet(STORAGE.records, items); }

  function saveRecord(item) {
    var list = records().filter(function (existing) { return existing && existing.recordId !== item.recordId; });
    list.push(item);
    return saveRecords(list);
  }

  function makeExportObject(controller) {
    return { kind: controller.kind, workshop: 'ISS-R5', recordId: controller.recordId, fields: collectFields(controller.form, controller.kind), consent: controller.consent.checked, exportedAt: new Date().toISOString() };
  }

  function exportCurrent(controller, format) {
    var data = makeExportObject(controller);
    if (format === 'csv') {
      var rows = [['kind', 'workshop', 'recordId', 'field', 'value', 'consent']];
      Object.keys(data.fields).forEach(function (key) { rows.push([data.kind, data.workshop, data.recordId, key, data.fields[key], data.consent ? 'true' : 'false']); });
      download(data.kind + '-' + data.recordId + '.csv', rows.map(function (row) { return row.map(escapeCsv).join(','); }).join('\r\n') + '\r\n', 'text/csv;charset=utf-8');
    } else {
      download(data.kind + '-' + data.recordId + '.json', JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
    }
    message(controller, '已导出本机当前表单；这不是集中提交。', 'The current form was exported locally; this is not a central submission.', 'info');
  }

  function endpoint() {
    var value = getConfig().formsEndpoint;
    return typeof value === 'string' && /^https?:\/\//i.test(value) ? value : '';
  }

  function setRecordIdAfterEdit(controller) {
    var snapshot = recordSnapshot(controller);
    var inFlight = controller.inFlightSnapshot;
    var changedSentRecord = controller.lastSubmittedSnapshot && snapshot !== controller.lastSubmittedSnapshot && controller.recordId === controller.lastSubmittedRecordId;
    var changedAttemptedRecord = controller.lastAttemptedSnapshot && snapshot !== controller.lastAttemptedSnapshot && controller.recordId === controller.lastAttemptedRecordId;
    var changedInFlightRecord = inFlight && snapshot !== inFlight.value && controller.recordId === inFlight.recordId;
    if (changedSentRecord || changedAttemptedRecord || changedInFlightRecord) {
      controller.recordId = newId();
      controller.submittedId = '';
      controller.lastSubmittedSnapshot = '';
      controller.lastSubmittedRecordId = '';
      controller.lastAttemptedSnapshot = '';
      controller.lastAttemptedRecordId = '';
    }
    saveDraft(controller);
  }

  function submit(controller) {
    if (controller.inFlightSnapshot) return;
    var fields = collectFields(controller.form, controller.kind);
    var payload = { kind: controller.kind, recordId: controller.recordId, workshop: 'ISS-R5', fields: fields, consent: controller.consent.checked };
    var error = validateSubmission(payload);
    if (error) { message(controller, error.split(' / ')[0], error.split(' / ')[1] || error, 'error'); return; }
    var url = endpoint();
    if (!url) { saveDraft(controller); message(controller, '在线提交未配置，已保存本机草稿；请使用导出。', 'Online submission is not configured. The draft was saved locally; please export it.', 'warning'); return; }
    var flight = {
      recordId: payload.recordId,
      fields: copyFields(payload.fields),
      consent: payload.consent === true,
      value: snapshotValue(payload.fields, payload.consent)
    };
    controller.lastAttemptedSnapshot = flight.value;
    controller.lastAttemptedRecordId = flight.recordId;
    controller.inFlightSnapshot = flight;
    controller.submitButton.disabled = true;
    message(controller, '正在提交……', 'Submitting…', 'info');
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'omit' })
      .then(function (response) {
        return response.text().then(function (text) { return { status: response.status, body: safeJsonParse(text) }; });
      })
      .then(function (result) {
        if (result.status < 200 || result.status >= 300 || !result.body || result.body.ok !== true || typeof result.body.id !== 'string' || !result.body.id) throw new Error('not-confirmed');
        if (controller.inFlightSnapshot !== flight) return;
        var currentValue = recordSnapshot(controller);
        if (currentValue !== flight.value && controller.recordId === flight.recordId) {
          controller.recordId = newId();
          controller.submittedId = '';
          controller.lastSubmittedSnapshot = '';
          controller.lastSubmittedRecordId = '';
          controller.lastAttemptedSnapshot = '';
          controller.lastAttemptedRecordId = '';
          currentValue = recordSnapshot(controller);
        }
        var item = { kind: controller.kind, workshop: 'ISS-R5', recordId: flight.recordId, id: result.body.id, createdAt: result.body.createdAt || new Date().toISOString(), fields: copyFields(flight.fields), consent: flight.consent };
        saveRecord(item);
        if (currentValue === flight.value && controller.recordId === flight.recordId) {
          controller.lastSubmittedSnapshot = flight.value;
          controller.lastSubmittedRecordId = flight.recordId;
          controller.submittedId = result.body.id;
          controller.lastReceiptId = result.body.id;
          saveDraft(controller);
          message(controller, '已收到服务器回执：' + result.body.id + '。修改后会生成新的记录编号。', 'Server receipt received: ' + result.body.id + '. Editing will create a new record ID.', 'success');
        } else {
          controller.lastSubmittedSnapshot = '';
          controller.lastSubmittedRecordId = '';
          controller.submittedId = '';
          controller.lastReceiptId = result.body.id;
          saveDraft(controller);
          message(controller, '旧内容已收到回执：' + result.body.id + '；当前修改尚未提交。', 'The previous content received receipt ' + result.body.id + '; current changes have not been submitted.', 'success');
        }
      })
      .catch(function () {
        if (controller.inFlightSnapshot !== flight) return;
        var currentValue = recordSnapshot(controller);
        if (currentValue !== flight.value && controller.recordId === flight.recordId) {
          controller.recordId = newId();
          controller.submittedId = '';
          controller.lastSubmittedSnapshot = '';
          controller.lastSubmittedRecordId = '';
          controller.lastAttemptedSnapshot = '';
          controller.lastAttemptedRecordId = '';
          currentValue = recordSnapshot(controller);
        }
        saveDraft(controller);
        if (currentValue === flight.value && controller.recordId === flight.recordId) {
          message(controller, '网络失败或服务器未确认；已保存草稿，可使用相同记录编号重试。', 'Network failure or no server confirmation; the draft was saved and can be retried with the same record ID.', 'warning');
        } else {
          message(controller, '网络失败或服务器未确认；当前修改已保留但尚未提交。', 'Network failure or no server confirmation; current changes were kept but have not been submitted.', 'warning');
        }
      })
      .finally(function () {
        if (controller.inFlightSnapshot === flight) {
          controller.inFlightSnapshot = null;
          controller.submitButton.disabled = !endpoint();
          saveDraft(controller);
        }
      });
  }

  function mount(form) {
    if (!form || form.__issCollectionMounted) return form && form.__issController;
    var kind = form.getAttribute('data-workshop-form');
    if (!SCHEMAS[kind]) return null;
    form.__issCollectionMounted = true;
    var controller = { form: form, kind: kind, recordId: newId(), lastSubmittedSnapshot: '', lastSubmittedRecordId: '', lastAttemptedSnapshot: '', lastAttemptedRecordId: '', submittedId: '', lastReceiptId: '', inFlightSnapshot: null };
    controller.consent = form.querySelector('[data-consent]');
    controller.notice = form.querySelector('[data-collection-notice]');
    controller.submitButton = form.querySelector('[data-action="submit"]');
    if (!controller.consent || !controller.notice || !controller.submitButton) return null;
    loadDraft(controller);
    controller.submitButton.disabled = !endpoint();
    if (!endpoint()) message(controller, '集中收集API尚未配置：在线提交未启用。本机草稿会保存，可导出JSON/CSV。', 'The collection API is not configured: online submission is disabled. Drafts are saved locally and can be exported.', 'warning');
    var controls = form.querySelectorAll('[data-field], [data-consent]');
    for (var i = 0; i < controls.length; i += 1) controls[i].addEventListener('input', function () { setRecordIdAfterEdit(controller); });
    form.addEventListener('submit', function (event) { event.preventDefault(); submit(controller); });
    var exportJson = form.querySelector('[data-action="export-json"]');
    var exportCsv = form.querySelector('[data-action="export-csv"]');
    if (exportJson) exportJson.addEventListener('click', function () { exportCurrent(controller, 'json'); });
    if (exportCsv) exportCsv.addEventListener('click', function () { exportCurrent(controller, 'csv'); });
    saveDraft(controller);
    return controller;
  }

  function validateImported(item) {
    if (!item || typeof item !== 'object' || !SCHEMAS[item.kind]) return false;
    var payload = { kind: item.kind, recordId: item.recordId, workshop: item.workshop, fields: item.fields, consent: item.consent === true || (typeof item.id === 'string' && item.id.length > 0) };
    return !validateSubmission(payload);
  }

  function renderRecordsPage() {
    var listNode = document.querySelector('[data-record-list]');
    if (!listNode) return;
    var list = records(); listNode.textContent = '';
    if (!list.length) { listNode.appendChild(document.createTextNode('暂无本机记录 / No local records.')); return; }
    list.forEach(function (item) {
      var article = document.createElement('article'); article.className = 'local-record';
      var title = document.createElement('h3'); title.textContent = item.kind + ' · ' + item.id; article.appendChild(title);
      var meta = document.createElement('p'); meta.textContent = 'recordId: ' + item.recordId + ' · ' + item.createdAt; article.appendChild(meta);
      var pre = document.createElement('pre'); pre.textContent = JSON.stringify(item.fields, null, 2); article.appendChild(pre);
      listNode.appendChild(article);
    });
  }

  function exportAll(format) {
    var list = records();
    if (format === 'json') download('iss-r5-local-records.json', JSON.stringify({ workshop: 'ISS-R5', records: list, exportedAt: new Date().toISOString() }, null, 2), 'application/json;charset=utf-8');
    else {
      var rows = [['kind', 'id', 'recordId', 'createdAt', 'field', 'value']];
      list.forEach(function (item) { Object.keys(item.fields || {}).forEach(function (key) { rows.push([item.kind, item.id, item.recordId, item.createdAt, key, item.fields[key]]); }); });
      download('iss-r5-local-records.csv', rows.map(function (row) { return row.map(escapeCsv).join(','); }).join('\r\n') + '\r\n', 'text/csv;charset=utf-8');
    }
  }

  function initRecords() {
    renderRecordsPage();
    var jsonButton = document.querySelector('[data-action="export-records-json"]');
    var csvButton = document.querySelector('[data-action="export-records-csv"]');
    var clearButton = document.querySelector('[data-action="clear-records"]');
    var importInput = document.querySelector('[data-action="import-records"]');
    if (jsonButton) jsonButton.addEventListener('click', function () { exportAll('json'); });
    if (csvButton) csvButton.addEventListener('click', function () { exportAll('csv'); });
    if (clearButton) clearButton.addEventListener('click', function () { if (global.confirm('只清除本机记录，不影响服务器数据。 / Clear only local records?')) { saveRecords([]); renderRecordsPage(); } });
    if (importInput) importInput.addEventListener('change', function () {
      var file = importInput.files && importInput.files[0]; if (!file || file.size > MAX_JSON_BYTES) { importInput.value = ''; return; }
      var reader = new FileReader(); reader.onload = function () {
        var parsed = safeJsonParse(String(reader.result || ''));
        var incoming = parsed && Array.isArray(parsed.records) ? parsed.records : (Array.isArray(parsed) ? parsed : [parsed]);
        if (!incoming.length || incoming.length > 500 || incoming.some(function (item) { return !validateImported(item); })) { global.alert('导入失败：schema、大小或必填项不符合。 / Import rejected: invalid schema, size, or required fields.'); return; }
        var merged = records().concat(incoming); if (bytes(JSON.stringify(merged)) > 5 * MAX_JSON_BYTES) { global.alert('导入失败：本机记录总量过大。 / Import rejected: local record total is too large.'); return; }
        saveRecords(merged); renderRecordsPage();
      }; reader.readAsText(file); importInput.value = '';
    });
  }

  function init() {
    var forms = document.querySelectorAll('[data-workshop-form="prework"], [data-workshop-form="convergence"]');
    for (var i = 0; i < forms.length; i += 1) mount(forms[i]);
    initRecords();
  }

  global.ISSCollection = { mount: mount, validate: validateSubmission, exportAll: exportAll };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}(window));
