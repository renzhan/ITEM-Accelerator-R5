// s13 Agent drafts + publishes the Dynamic Page · s14 supervisor dispatches · s15 how Move Damage was built
(() => {
  const { icon, webTopbar, webAgentPanel, waTool, waCard } = UI;

  const ISSUES = [
    ['ISSUE-106', 'A12-05-1', 'CLP-1005744', 'NB-BAT57-3C · 57Wh 3-Cell Notebook Battery', '12 EA', 'John Smith', '10/27/2026 10:12'],
    ['ISSUE-107', 'A12-04-2', 'CLP-1005745', 'NB-ADP65-USBC · 65W USB-C Power Adapter', '20 EA', 'John Smith', '10/27/2026 10:19'],
    ['ISSUE-104', 'B03-02-1', 'CLP-1005611', 'NB-KB14-US · 14" US Keyboard Assembly', '6 EA', 'Ana Lopez', '10/26/2026 16:05'],
  ];

  // The Damaged Inventory Relocation page as wms-web renders it (body from PDEF-101).
  function relocationPage({ width, draft = false, compact = false }) {
    const cols = compact ? ['Issue', 'Location', 'LPN', 'Item', 'Qty'] : ['Issue', 'Location', 'LPN', 'Item', 'Reported Qty', 'Reported By', 'Reported At'];
    const asideW = compact ? 300 : 340;
    return `
      <div class="web" style="position:relative;width:${width}px;height:100%">
        ${webTopbar()}
        <div class="content">
          <div class="crumb">Custom Apps · Dynamic Pages</div>
          <div class="title">Damaged Inventory Relocation</div>
          <div class="desc">Review damage reports from patrols and create one Move Damage task to bring the selected stock to the damage location.</div>
          ${draft ? `<div class="banner dbn"><span class="pill warning dpill">Draft</span><span class="dtext">Draft v1 — not published. Others still see the published version.</span><span style="margin-left:auto" class="btn link">Reload Draft</span><span class="btn primary pub">Publish</span></div>` : ''}
          <div class="panel"><div class="panel-h">Search Criteria</div>
            <div class="panel-b" style="display:flex;gap:14px;align-items:flex-end">
              ${['Keyword|Issue, LPN or note', 'Location|Search', 'Item|Search'].map((f) => { const [l, p] = f.split('|'); return `<div style="flex:1"><div class="field-label">${l}</div><div class="input">${p}</div></div>`; }).join('')}
              <span class="btn">Search</span>
            </div>
          </div>
          <div style="display:flex;gap:14px;align-items:flex-start">
            <div class="panel" style="flex:1;min-width:0"><div class="panel-h">Damaged Issues</div>
              <div class="panel-b" style="padding:12px 14px">
                <div style="color:var(--secondary);margin-bottom:10px" class="tot">Total 3 records</div>
                <table>
                  <tr><th style="width:36px"><span class="cb"></span></th>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>
                  ${ISSUES.map((r, i) => `<tr class="ir ir${i}"><td><span class="cb cb${i}"></span></td>${r.slice(0, cols.length).map((v, j) => `<td class="${j === 0 ? 'link' : ''}" style="${j === 3 ? 'white-space:normal' : ''}">${v}</td>`).join('')}</tr>`).join('')}
                </table>
              </div>
            </div>
            <div class="panel" style="width:${asideW}px;flex:none"><div class="panel-h">Actions</div>
              <div class="panel-b">
                <div style="color:var(--secondary);font-size:14.5px;line-height:1.5">Damaged stock is placed at the suggested damage location when the worker scans it at Place.</div>
                <div class="field-label" style="margin-top:14px">Worker</div>
                <div class="input wk" style="position:relative"><span class="wkv">Search</span>
                  <div class="dd" style="position:absolute;left:-1px;right:-1px;top:36px;background:#fff;border:1px solid var(--line-strong);border-radius:6px;box-shadow:0 8px 20px rgba(31,41,51,.12);z-index:3;color:var(--text)">
                    <div style="padding:9px 12px;background:#f6f3fd">Maria Garcia</div><div style="padding:9px 12px">Mario Rossi</div></div>
                </div>
                <div class="field-label" style="margin-top:14px">Task Title</div>
                <div class="input ttl"><span class="ttv">Move Damage</span></div>
                <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:flex-end"><span class="btn primary crt">Create Move Damage Task</span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="toast wtoast">${icon('check', 16, '#166534', 2.4)}<span class="wtt">Created TASK-18652</span><span class="tx">${icon('x', 14, '#166534', 2.2)}</span></div>
      </div>`;
  }

  // Agent Shell in split view (agent-workspace-web App.tsx): the Workspace Browser shows wms-web at full height on the
  // left; the Agent panel is docked on the right with its own header.
  function shell({ title, chat, browser, chatWidth = 700 }) {
    return `
      <div style="position:absolute;inset:0;background:#fff">
        <div style="position:absolute;left:0;right:${chatWidth}px;top:0;bottom:0;overflow:hidden">${browser}</div>
        <div style="position:absolute;right:0;top:0;bottom:0;width:${chatWidth}px">${webAgentPanel({ title, body: chat })}</div>
        <div class="wa-divider" style="right:${chatWidth}px"></div>
      </div>`;
  }

  Scene('s13-page-build', { title: '构建工作台页面', tag: '示意画面 · 页面定义来自本地 PDEF-101', tagKind: 'sim', captionRight: 700 }, ({ root, S, E, show, pop, stagger, anim, fadeIn, text, cls, hide, pointer, fn }) => {
    const SAID = '做一个工作台：列出巡检上报、还没处理的破损库存，勾选后创建 Move Damage 任务，派给指定员工。';
    const chat = `
      <div class="q wa-user">${SAID}</div>
      <div class="wa-tools">
        <div class="tl">${waTool('brain', '[Skill] genui-task-pages')}</div>
        <div class="tl">${waTool('sparkles', '[wms_api] POST /inventory/inventory-issue/search')}</div>
        <div class="tl">${waTool('sparkles', '[save_view_module] issues · sha256 15e9e8a8…')}</div>
        <div class="tl">${waTool('sparkles', '[preview_view] issues · 3 rows · 184 ms')}</div>
        <div class="tl">${waTool('sparkles', '[draft_genui_page] damaged-inventory-relocation · Draft v1')}</div>
      </div>
      <div class="ans wa-text">草稿已就绪，左侧是预览，用的是真实数据。Move Damage 任务类型按 <span class="mono">move-damage</span> 引用，换仓库也能用。确认后点 <b>Publish</b>。</div>
      <div class="wkd wa-tool">${icon('clock', 16, 'var(--muted)')}Worked for 42s</div>`;
    root.innerHTML = `
      ${shell({ title: 'New conversation', chat, browser: `<div class="br" style="position:absolute;inset:0">${relocationPage({ width: 1220, draft: true, compact: true })}</div>` })}
      <div class="mbg" style="position:absolute;inset:0 700px 0 0;background:rgba(0,0,0,.3)"></div>
      <div class="modal card" style="position:absolute;left:300px;top:270px;width:620px;padding:0;overflow:hidden;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,.2)">
        <div style="padding:18px 22px;font-size:19px;font-weight:700;border-bottom:1px solid var(--line)">Publish Damaged Inventory Relocation v1?</div>
        <div style="padding:16px 22px;font-size:15.5px;line-height:1.7">
          <div style="color:var(--secondary)">Viewers need these permissions — computed from every call the page makes:</div>
          ${[['ops/inventory-issue:read', 'issues view'], ['master-data/location:read', 'Location lookup'], ['ops/genui-task:write', 'Create Move Damage Task'], ['ops/inventory-issue:write', 'link issues to the task']].map(([p, why]) => `<div class="pm" style="display:flex;gap:10px;align-items:center;margin-top:6px">${icon('shield', 17, 'var(--primary)')}<span class="mono" style="font-size:14.5px">${p}</span><span style="color:var(--muted);font-size:14px">· ${why}</span></div>`).join('')}
          <div style="margin-top:12px;color:var(--secondary)">Body hash <span class="mono">b71e…2c90</span> — publish refuses a Draft that changed after review.</div>
        </div>
        <div style="padding:12px 22px;display:flex;justify-content:flex-end;gap:10px;background:#fafbfd;border-top:1px solid var(--line)"><span class="btn" style="height:32px;padding:0 14px;border:1px solid var(--line-strong);border-radius:6px;display:inline-flex;align-items:center">Cancel</span><span class="mpub" style="height:32px;padding:0 16px;border-radius:6px;background:var(--primary);color:#fff;display:inline-flex;align-items:center;font-weight:600">Publish</span></div>
      </div>`;
    // Hold to talk on the web composer (AgentInputBar): holding the mic (or right Ctrl) records; the box border turns
    // primary and a status row says Listening. Release sends the recording for transcription: the status reads
    // Transcribing while a blue fill sweeps the box, then the words land in the box and Send is enabled.
    const tPress = S('pb-1', 0.5), tListen = tPress + 0.2, tRelease = S('pb-1', 4.0), tDone = tRelease + 1.0, tSend = tDone + 0.9;
    pointer([[tPress - 0.8, 1500, 860], [tPress, '.wa-composer .mic', null, 'hold'], [tRelease, '.wa-composer .mic'], [tSend, '.wa-composer .send', null, true], [tSend + 0.5, '.wa-composer .send']]);
    cls('.wa-composer .mic', 'held', tPress, tRelease);
    cls('.wa-composer .box', 'busy', tListen, tDone);
    anim('.wa-status', tListen, 0.15, { height: [0, 30] });
    anim('.wa-status', tDone, 0.15, { height: 0 });
    text('.wa-status .st', tRelease, 'Transcribing…');
    cls('.wa-status .badge', 'idle', tRelease);
    // The listening badge pings (Tailwind animate-ping: 1 s, out to 2x and transparent).
    const ping = root.querySelector('.wa-status .ping');
    fn((t) => {
      const cycle = t >= tListen && t < tRelease ? ((t - tListen) % 1) / 1 : -1;
      ping.style.opacity = cycle < 0 ? 0 : 0.5 * (1 - cycle);
      ping.style.transform = `scale(${cycle < 0 ? 1 : 1 + cycle})`;
    });
    // useWebDictation fill: 72% at once, creeps while the model finishes, closes when the transcript arrives, resets.
    anim('.wa-fill', tRelease, 0.45, { clip: [0, 72] }, 'out');
    anim('.wa-fill', tRelease + 0.45, tDone - tRelease - 0.45, { clip: 80 }, 'linear');
    anim('.wa-fill', tDone, 0.16, { clip: 100 }, 'out');
    anim('.wa-fill', tDone + 0.22, 0.01, { clip: 0 });
    anim('.wa-composer .ph', tDone, 0.1, { opacity: [1, 0] });
    anim('.wa-typed', tDone, 0.12, { opacity: [0, 1] });
    text('.wa-typed', tDone, SAID);
    anim('.wa-input', tDone, 0.15, { height: [40, 65] });
    cls('.wa-composer .send', 'ready', tDone, tSend + 0.15);
    // Send: the box clears, the message joins the conversation and titles it a moment later.
    anim('.wa-typed', tSend + 0.1, 0.1, { opacity: 0 });
    anim('.wa-composer .ph', tSend + 0.1, 0.2, { opacity: 1 });
    anim('.wa-input', tSend + 0.1, 0.15, { height: 40 });
    show('.q', tSend + 0.15);
    anim('.wa-title', tSend + 0.85, 0.15, { opacity: [1, 0.2] });
    text('.wa-title', tSend + 1.0, '破损库存转移工作台');
    anim('.wa-title', tSend + 1.0, 0.3, { opacity: 1 });
    stagger('.tl', tSend + 0.7, 0.8, 'show');
    anim('.br', tSend + 3.4, 0.6, { opacity: [0, 1] });
    show('.ans', tSend + 4.5);
    show('.wkd', tSend + 5.0);
    // Publish: open the review dialog, then publish.
    const p0 = S('pb-2', 0.3);
    pointer([[p0 - 1.2, 600, 500], [p0, '.pub', null, true], [p0 + 0.5, '.pub']]);
    anim('.mbg', p0 + 0.3, 0.25, { opacity: [0, 1] });
    anim('.modal', p0 + 0.3, 0.35, { opacity: [0, 1], scale: [0.96, 1] });
    stagger('.pm', p0 + 1.2, 0.5, 'fadeIn');
    const p1 = p0 + 5.4;
    pointer([[p1 - 1.0, 750, 500], [p1, '.mpub', null, true], [p1 + 0.6, '.mpub']]);
    anim('.mbg', p1 + 0.3, 0.25, { opacity: 0 });
    anim('.modal', p1 + 0.3, 0.25, { opacity: 0 });
    text('.dpill', p1 + 0.4, 'Published');
    cls('.dpill', 'success', p1 + 0.4); cls('.dpill', 'warning', 0, p1 + 0.4);
    text('.dtext', p1 + 0.4, 'Published v1 — listed under Custom Apps for every facility of the tenant.');
    hide('.pub', p1 + 0.4, 0.2);
  });

  Scene('s14-page-use', { title: '工作台派工', tag: '示意画面 · 页面定义来自本地 PDEF-101', tagKind: 'sim' }, ({ root, S, E, show, pop, stagger, anim, fadeIn, text, cls, hide, pointer, type }) => {
    root.innerHTML = `
      <div style="position:absolute;inset:0">${relocationPage({ width: 1920 })}</div>
      <div class="req card" style="position:absolute;left:22px;top:560px;width:1150px;padding:0;overflow:hidden;box-shadow:0 18px 50px rgba(31,41,51,.18)">
        <div style="padding:12px 20px;background:var(--section);font-weight:700;font-size:16px;display:flex;gap:10px;align-items:center">${icon('send', 17, 'var(--primary)')} 页面以 Quinn Chen 本人身份直接调用 WMS</div>
        <div class="mono" style="padding:14px 20px;font-size:15px;line-height:1.75">
          <div><b style="color:var(--primary)">POST</b> /ops/genui-task-type/<span style="color:var(--primary)">{{taskType.move-damage}}</span>/tasks <span style="color:var(--muted)">→ TDEF-151</span></div>
          <div style="color:var(--secondary)">Authorization: Bearer ‹Quinn Chen› · Idempotency-Key: 7f3c…e1</div>
          <div style="color:var(--secondary)">fdnwms-screen-id: <b style="color:var(--primary)">page:damaged-inventory-relocation@v1</b></div>
          <div>{ lines.moves: [CLP-1005744 · 12 EA, CLP-1005745 · 20 EA], inventoryIssueIds: [ISSUE-106, ISSUE-107], assignee: Maria Garcia }</div>
        </div>
        <div class="resp" style="padding:12px 20px;border-top:1px solid var(--line);display:flex;gap:12px;align-items:center;font-size:16px">
          <span class="pill success">201 Created</span><b class="mono">TASK-18652</b> · Move Damage · Maria Garcia
          <span style="margin-left:auto" class="pill info">ISSUE-106 · ISSUE-107 → In Progress</span>
        </div>
      </div>`;
    const p = S('pu-1', 4.2);
    pointer([[p - 1.2, 900, 600], [p, '.cb0', null, true], [p + 0.9, '.cb1', null, true], [p + 1.6, '.cb1']]);
    cls('.cb0', 'on', p); cls('.ir0', 'sel', p);
    cls('.cb1', 'on', p + 0.9); cls('.ir1', 'sel', p + 0.9);
    const w = p + 2.6;
    pointer([[w - 0.6, 1500, 420], [w, '.wk', null, true], [w + 1.9, '.dd', [0, -18], true], [w + 2.6, '.dd', [0, -18]]]);
    type('.wkv', w + 0.4, 'Mar', 8, w + 1.95);
    anim('.dd', w + 0.9, 0.2, { opacity: [0, 1] });
    anim('.dd', w + 1.95, 0.15, { opacity: 0 });
    text('.wkv', w + 1.95, 'Maria Garcia');
    cls('.wk', 'filled', w + 1.95);
    const t = w + 3.0;
    text('.ttv', t, '');
    type('.ttv', t + 0.3, 'Move Damage · Aisle A12', 20);
    cls('.ttl', 'filled', t);
    const c = S('pu-1', 12.4);
    pointer([[c - 1.0, 1700, 520], [c, '.crt', null, true], [c + 0.8, '.crt']]);
    anim('.wtoast', c + 0.7, 0.3, { opacity: [0, 1], y: [-10, 0] });
    anim('.wtoast', c + 5, 0.3, { opacity: 0 });
    // The table refreshes: both issues moved to In Progress and leave the Open list.
    hide('.ir0, .ir1', c + 1.4, 0.4); cls('.ir0, .ir1', 'gone', c + 1.8);
    text('.tot', c + 1.4, 'Total 1 record');
    cls('.cb0, .cb1', 'on', 0, c + 1.4);
    show('.req', S('pu-2', 0.6), 0.5);
    anim('.resp', S('pu-2', 5.0), 0.4, { opacity: [0, 1] });
  });

  // The Move Damage type is built in the Agent Workspace with the mobile app in the Workspace Browser: the Agent drafts
  // the type (draft_genui_task_type) and presents its review card; Try it opens a trial task on the embedded mobile app,
  // and Publish makes v1. (Mobile users can build it the same way from the handheld's own Agent.)
  const tPubAt = (S) => S('tb-2', 10.0);
  Scene('s15-type-build', { title: '构建 Move Damage', tag: '示意画面 · 类型定义来自本地 TDEF-151', tagKind: 'sim', captionRight: 700 }, ({ root, S, E, show, pop, stagger, anim, fadeIn, text, cls, hide, pointer }) => {
    const chat = `
      <div class="q wa-user">把破损库存搬到坏货区，做成可以复用的任务类型。搬哪些，由工作台传进来。</div>
      <div class="wa-tools">
        <div class="tl">${waTool('brain', '[Skill] genui-task-pages')}</div>
        <div class="tl">${waTool('sparkles', '[list_composable_steps] Move Inventory · Take → Place')}</div>
        <div class="tl">${waTool('brain', '[Skill] wms-settings · put-away mapping')}</div>
        <div class="tl">${waTool('sparkles', '[draft_genui_task_type] Move Damage · Draft v1')}</div>
      </div>
      <div class="ans wa-text">草稿好了，只用一个 composable step。先在左边手机上试一遍，没问题再发布。</div>
      <div class="rc">${waCard({
        title: 'Move Damage · Draft v1', subtitle: 'Dynamic Task Type · 1 step', badge: ['Draft', 'warning'],
        rows: [
          ['r1', 'Step', '1 · Move damaged stock to the damage location', 'composable-move-inventory'],
          ['r2', 'Input for each new task', 'Moves — line set supplied by the page that starts it', 'fromLpn · fromLocationCode · itemId · qty · uomId'],
          ['r3', 'Goods condition', 'Damaged'],
          ['r4', 'Destination', 'Not fixed — Place follows the put-away suggestion', '<span class="map">Damaged → Damaged Goods → DMG (DMG-01)</span>'],
        ],
        actions: [['pub', 'Publish'], ['try', 'Try it'], ['', `${icon('monitor', 16)} Open on Web`]],
      })}</div>`;
    // Embedded mobile app: Quinn's My Tasks, then the trial task that Try it opens.
    const step = (cls) => `<div class="m-row ${cls}" style="margin-top:10px"><span style="width:28px;height:28px;border-radius:50%;background:var(--raised);display:grid;place-items:center;font-size:13px;font-weight:700">1</span><div><div style="font-weight:600">Move damaged stock to the damage location</div><div style="font-size:13.5px;color:var(--muted)" class="tst">New</div></div></div>`;
    const device = UI.wsDevice(`
      <div style="position:absolute;inset:0;background:var(--canvas)">
        ${UI.mHeader('My Tasks', 'Quinn Chen · Valley View', { back: false, acts: ['refresh', 'more'] })}
        <div class="m-section-title">DYNAMIC TASKS</div>
        <div class="m-row">${icon('blocks', 22, 'var(--secondary)')}<div><div style="font-weight:600">Inventory Patrol</div><div style="font-size:13.5px;color:var(--muted)">Published v1</div></div></div>
        <div class="m-section-title">OPEN TASKS</div>
        ${[['inbox', 'Receive', 17], ['box', 'Put Away', 14], ['route', 'Pick', 17]].map(([ic, n, c]) => `<div class="m-row">${icon(ic, 22, 'var(--secondary)')}${n}<span class="m-badge" style="margin-left:auto">${c}</span></div>`).join('')}
      </div>
      <div class="trial" style="position:absolute;inset:0;background:var(--canvas)">
        ${UI.mHeader('TASK-18649', 'Trial · Move Damage')}
        <div class="m-sec"><div class="m-label">Task</div><div class="m-value">Trial · Move Damage</div></div>
        <div class="m-sec"><div class="m-label">Moves</div><div class="m-value tln">0/1 Lines</div><div class="mono" style="font-size:13.5px;color:var(--secondary);margin-top:4px">CLP-1005743 · NB-BAT57-3C · 6 EA · A12-03-1</div><div style="display:flex;justify-content:flex-end;margin-top:6px"><span class="pill success tsp" style="font-size:13px">0/1 steps</span></div></div>
        ${step('tstep')}
        <div class="tdone pill success" style="position:absolute;left:50%;bottom:30px;translate:-50% 0;font-size:16px;padding:8px 20px">${icon('checkCircle', 18)} Task Closed</div>
      </div>
      <div class="trun" style="position:absolute;inset:0;background:var(--canvas)">
        ${UI.moveTakeScreen({ title: 'TASK-18649', sub: 'Trial · Move Inventory', step: '1 of 1', item: 'NB-BAT57-3C', itemName: '57Wh 3-Cell Notebook Battery', qty: 6, uom: 'EA', fromLpn: 'CLP-1005743', location: 'A12-03-1' })}
      </div>
      <div class="trun2" style="position:absolute;inset:0;background:var(--canvas)">
        ${UI.movePlaceScreen({ title: 'TASK-18649', sub: 'Trial · Move Inventory', step: '1 of 1', toLpn: 'CLP-1005799', item: 'NB-BAT57-3C', qty: 6, uom: 'EA', suggestion: 'DMG-01' })}
      </div>`);
    root.innerHTML = shell({ title: 'New conversation', chat, browser: `<div style="position:absolute;inset:0;background:#fff">${device}</div>` });
    // tb-1: the request, the Agent's lookups, the draft and its review card; rows light up as the narration names them.
    show('.q', S('tb-1', 0.1));
    anim('.wa-title', S('tb-1', 1.0), 0.15, { opacity: [1, 0.2] });
    text('.wa-title', S('tb-1', 1.15), 'Move Damage 任务类型');
    anim('.wa-title', S('tb-1', 1.15), 0.3, { opacity: 1 });
    stagger('.tl', S('tb-1', 1.0), 0.8, 'show');
    show('.ans', S('tb-1', 4.0));
    show('.rc', S('tb-1', 4.4));
    cls('.r1', 'hl', S('tb-1', 5.4), S('tb-1', 8.6));
    cls('.r2', 'hl', S('tb-1', 8.6), S('tb-1', 11.0));
    cls('.r3', 'hl', S('tb-1', 11.0), S('tb-1', 12.0));
    cls('.r4', 'hl', S('tb-1', 12.0), S('tb-2', 4.0));
    // tb-2: the destination resolves through the put-away mapping.
    anim('.map', S('tb-2', 0.4), 0.4, { opacity: [0, 1] });
    // Try it: a trial task opens on the embedded mobile app and Quinn runs it once, phase by phase: Take (location,
    // item, Qty · To LPN), then Place at the suggestion.
    const tTry = S('tb-2', 4.4);
    text('.wac-run', tTry + 0.4, 'Trial TASK-18649 opened on Mobile');
    anim('.trial', tTry + 0.5, 0.45, { x: [400, 0] }, 'inOut');
    const tStep = tTry + 1.1;
    anim('.trun', tStep + 0.3, 0.4, { x: [400, 0] }, 'inOut');
    const ok = (box, value, when) => { text(`${box} .v`, when, value); cls(box, 'ok', when); };
    ok('.mt-loc', 'A12-03-1', tStep + 0.8); cls('.trun .ph1', 'done', tStep + 0.8); cls('.trun .ph2', 'on', tStep + 0.8);
    ok('.mt-item', 'NB-BAT57-3C', tStep + 1.15); fadeIn('.mt-ihint', tStep + 1.2, 0.2);
    cls('.trun .ph2', 'done', tStep + 1.15); cls('.trun .ph3', 'on', tStep + 1.15);
    text('.mt-qty', tStep + 1.45, '6');
    ok('.mt-to', 'CLP-1005799', tStep + 1.75);
    anim('.trun2', tStep + 2.25, 0.4, { x: [400, 0] }, 'inOut');
    ok('.mp-held', 'CLP-1005799', tStep + 2.7); cls('.trun2 .ph1', 'done', tStep + 2.7); cls('.trun2 .ph2', 'on', tStep + 2.7);
    ok('.mp-dest', 'DMG-01', tStep + 3.0); cls('.trun2 .ph2', 'done', tStep + 3.0);
    const tBack = tStep + 3.5;
    anim('.trun, .trun2', tBack, 0.4, { x: 400 }, 'inOut');
    text('.tst', tStep + 0.3, 'In Progress');
    text('.tst', tBack, 'Closed');
    text('.tln', tBack, '1/1 Lines');
    text('.tsp', tBack, '1/1 steps');
    show('.tdone', tBack + 0.3);
    pointer([[tTry - 1.0, 1500, 700], [tTry, '.try', null, true], [tStep - 0.1, '.tstep', [-60, 0]], [tStep, '.tstep', [-60, 0], true], [tStep + 0.6, '.tstep', [-60, 0]],
      [tPubAt(S) - 1.0, '.pub', [0, -60]], [tPubAt(S), '.pub', null, true], [tPubAt(S) + 0.6, '.pub']]);
    // Publish: v1 goes live.
    const tPub = tPubAt(S);
    text('.wac-badge', tPub + 0.4, 'Published v1');
    cls('.wac-badge', 'success', tPub + 0.4); cls('.wac-badge', 'warning', 0, tPub + 0.4);
    text('.wac-h .t', tPub + 0.4, 'Move Damage · v1');
    text('.pub', tPub + 0.4, 'Published');
    cls('.pub, .try', 'off', tPub + 0.4);
    text('.wac-run', tPub + 0.4, 'Published Move Damage v1 · pages can start it as {{taskType.move-damage}}');
  });
})();
