// s00 title · s01 pain · s02 ontology · s03 permission
(() => {
  const { icon, logo, chapter } = UI;

  Scene('s00-title', { title: '标题' }, ({ root, S, E, show, pop, fadeIn, stagger }) => {
    root.innerHTML = `
      <div style="position:absolute;inset:0;background:radial-gradient(900px 520px at 50% 42%, rgba(85,53,160,.10), transparent 70%)"></div>
      <div style="position:absolute;left:0;right:0;top:210px;display:flex;flex-direction:column;align-items:center;text-align:center">
        <div class="t-logo">${logo(118)}</div>
        <div class="t-brand" style="margin-top:20px;font-size:34px;font-weight:600;color:var(--strong)">Item WMS</div>
        <div class="t-head" style="margin-top:26px;font-size:76px;font-weight:800;color:var(--strong);letter-spacing:2px">动态表单 <span style="color:var(--primary)">Dynamic Forms</span></div>
        <div class="t-sub" style="margin-top:20px;font-size:32px;color:var(--secondary)">懂 WMS 的 Agent，把现场需求变成可发布的业务应用</div>
        <div class="t-meta" style="margin-top:34px;font-size:20px;color:var(--muted);letter-spacing:1px">ITEM × COO AI Team · R5 · MD §D1.2.2 · 02 WMS 动态表单</div>
      </div>
      <div class="t-legend" style="position:absolute;left:0;right:0;top:790px;display:flex;justify-content:center;gap:18px">
        <span class="chip"><span class="tag-dot real"></span>真实定义 / 真实数据</span>
        <span class="chip"><span class="tag-dot sim"></span>示意画面（基于本地 WMS 真实定义）</span>
      </div>`;
    pop('.t-logo', 0.3, 0.7);
    show('.t-brand', 0.6);
    show('.t-head', 0.9, 0.6, 26);
    show('.t-sub', 1.6);
    fadeIn('.t-meta', 2.4);
    stagger('.t-legend .chip', E('title-1', -3), 0.25);
  });

  Scene('s01-pain', { title: '从层层转述到直接对话' }, ({ root, segs, anim, show, fadeIn, pop, stagger, cls }) => {
    // Place a beat at a fraction of a narration segment.
    const P = (segId, fraction) => (segs[segId] ? segs[segId].start + fraction * (segs[segId].end - segs[segId].start) : 0);
    const chain = [
      ['warehouse', '现场', '提出需求'],
      ['users', '支持 / 实施', '收集、转述'],
      ['file', '产品经理', '整理需求文档'],
      ['code', '开发', '排期开发'],
      ['flask', '测试', '测试验证'],
      ['rocket', '上线', '发布上线'],
    ];
    // What each hand-off passes on (illustrative): the request as that role words it, and which of the three
    // context tags the narration names survive. A tag is lost at hop `lostAt` and stays lost downstream.
    const quotes = ['破损要拍照留证', '破损要拍照留证', '破损拍照登记', '破损登记页面', '破损登记页面', '破损登记页面'];
    const contexts = [['背景', 2], ['痛点', 3], ['优先级', 1]];
    const tags = (hop = 0) => `<div class="pn-tags">${contexts.map(([label, lostAt]) => `
      <span class="pn-tag" data-lost-at="${lostAt <= hop ? lostAt : ''}">${label}<i class="pn-wash"></i></span>`).join('')}</div>`;
    const CARD_W = 236, STEP = 284, LEFT = 132;
    const centerX = (index) => LEFT + index * STEP + CARD_W / 2;
    const card = (cls, x, y, w, ic, name, desc, no = '', extra = '') => `
      <div class="card pn-card ${cls}" style="left:${x}px;top:${y}px;width:${w}px">
        <div class="pn-head">${icon(ic, 24)}${no ? `<span class="pn-no">${no}</span>` : ''}</div>
        <div class="pn-name">${name}</div>
        <div class="pn-desc">${desc}</div>
        ${extra}
      </div>`;
    // Vertical layout: chain cards, the hand-off notes under them, the rework loop, then the after section.
    const NOTE_Y = 436, LOOP_TOP = 530, LOOP_Y = 578, AFTER = 656;
    // Iteration cycle: four stops on a circle, clockwise from the top.
    const CX = 1062, CY = AFTER + 122, R = 80;
    const stops = ['描述', '初版', '试用', '修改'];
    const at = (deg) => [CX + R * Math.cos((deg * Math.PI) / 180), CY + R * Math.sin((deg * Math.PI) / 180)];
    const arcs = stops.map((_, index) => {
      const [x1, y1] = at(-90 + index * 90 + 24), [x2, y2] = at(-90 + (index + 1) * 90 - 24);
      return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" marker-end="url(#pn-tip-primary)"/>`;
    }).join('');
    root.innerHTML = `
      ${chapter('背景 · Before / After', '从层层转述，到需求方直接对话', '异常登记、状态采集、任务确认、临时分析页面')}
      <svg width="0" height="0" style="position:absolute"><defs>
        <marker id="pn-tip-warning" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M2 1.5 L9 6 L2 10.5" fill="none" stroke="#b45309" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></marker>
        <marker id="pn-tip-primary" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto"><path d="M2 1.5 L9 6 L2 10.5" fill="none" stroke="#5535a0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></marker>
        <marker id="pn-tip-link" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M2 1.5 L9 6 L2 10.5" fill="none" stroke="#5535a0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></marker>
        <mask id="pn-loop-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><path class="pn-loop-reveal" d="M${centerX(5)} ${LOOP_TOP - 4} V${LOOP_Y - 16} Q${centerX(5)} ${LOOP_Y} ${centerX(5) - 16} ${LOOP_Y} H${centerX(0) + 16} Q${centerX(0)} ${LOOP_Y} ${centerX(0)} ${LOOP_Y - 16} V${LOOP_TOP}" fill="none" stroke="#fff" stroke-width="24" pathLength="1" stroke-dasharray="1"/></mask>
      </defs></svg>

      <div class="pn-before">
        <div class="pn-section" style="top:252px">改造前 · 传统交付链路</div>
        <div class="pn-legend">每一环拿到的需求（示意）</div>
        ${chain.map(([ic, name, desc], index) => card('pn-step', LEFT + index * STEP, 292, CARD_W, ic, name, desc, String(index + 1).padStart(2, '0'))).join('')}
        ${chain.slice(1).map((_, index) => `<div class="pn-arrow" style="left:${LEFT + index * STEP + CARD_W + 10}px;top:343px">${icon('chevronRight', 28, 'rgba(85,53,160,.5)', 2.4)}</div>`).join('')}
        ${quotes.map((quote, index) => `
          <div class="pn-note" style="left:${LEFT + index * STEP}px;top:${NOTE_Y}px;width:${CARD_W}px">
            <div class="pn-quote">“${quote}”</div>${tags(index)}
          </div>`).join('')}
        <svg class="pn-loop" style="position:absolute;left:0;top:0" width="1920" height="1080" mask="url(#pn-loop-mask)">
          <path d="M${centerX(5)} ${LOOP_TOP - 4} V${LOOP_Y - 16} Q${centerX(5)} ${LOOP_Y} ${centerX(5) - 16} ${LOOP_Y} H${centerX(0) + 16} Q${centerX(0)} ${LOOP_Y} ${centerX(0)} ${LOOP_Y - 16} V${LOOP_TOP}" fill="none" stroke="#b45309" stroke-width="2.4" stroke-dasharray="9 7" marker-end="url(#pn-tip-warning)"/>
        </svg>
        <div class="pn-loop-label pill warning" style="top:${LOOP_Y}px">${icon('clock', 16)} 周期长 · 上线后改一处，整条链路重走一遍</div>
      </div>

      <div class="pn-after">
        <div class="pn-section primary" style="top:${AFTER}px">现在 · 需求方直接和 Agent 对话</div>
        ${card('pn-me', LEFT, AFTER + 42, 300, 'warehouse', '现场 · 需求方', '仓库主管 / 一线员工', '', tags())}
        <div class="pn-link" style="left:${LEFT + 300}px;top:${AFTER + 42}px">
          <div class="pn-link-label">直接对话</div>
          <svg width="120" height="40" viewBox="0 0 120 40"><path d="M14 20 H106" stroke="#5535a0" stroke-width="2.4" marker-start="url(#pn-tip-link)" marker-end="url(#pn-tip-link)"/></svg>
        </div>
        ${card('pn-agent', LEFT + 420, AFTER + 42, 300, 'sparkles', 'Item WMS Agent', '当场生成初版，按反馈修改', '', tags())}
        <div class="pn-cycle">
          <svg style="position:absolute;left:0;top:0" width="1920" height="1080"><g fill="none" stroke="#5535a0" stroke-width="2.2" stroke-opacity=".55">${arcs}</g></svg>
          <div class="pn-cycle-core" style="left:${CX}px;top:${CY}px">一次对话<br>一轮迭代</div>
          ${stops.map((stop, index) => { const [x, y] = at(-90 + index * 90); return `<div class="pn-stop" style="left:${x}px;top:${y}px">${stop}</div>`; }).join('')}
        </div>
        <div class="pn-gains" style="top:${AFTER + 50}px">
          ${[['一手语境', '需求方亲自说明，没有转述损耗'], ['当场试用', '初版生成后，现场直接上手'], ['低成本迭代', '哪里不对直接改，不再重走链路']].map(([head, desc]) => `
            <div class="pn-gain"><span class="pn-check">${icon('check', 18, '#fff', 3)}</span><div><b>${head}</b><span>${desc}</span></div></div>`).join('')}
        </div>
      </div>`;

    // pain-1: the chain builds up as the narration names each hand-off.
    show('.pn-before .pn-section', P('pain-1', 0.4));
    root.querySelectorAll('.pn-step').forEach((el, index) => {
      const t = P('pain-1', 0.44 + index * 0.085);
      show(el, t);
      if (index) fadeIn(root.querySelectorAll('.pn-arrow')[index - 1], t - 0.15);
    });
    // pain-2: the note passed down each hand-off; the tag lost at that hop slowly fades out after the note lands
    // (overlooked, not rejected: no red), tags lost upstream arrive already faded. Then the rework loop.
    fadeIn('.pn-legend', P('pain-2', 0.02));
    root.querySelectorAll('.pn-note').forEach((note, index) => {
      const t = P('pain-2', 0.04 + index * 0.075);
      show(note, t, 0.4, -12);
      note.querySelectorAll('.pn-tag[data-lost-at]').forEach((tag) => {
        if (!tag.dataset.lostAt) return;
        const fresh = Number(tag.dataset.lostAt) === index;
        if (fresh) anim(tag.querySelector('.pn-wash'), t + 0.4, 1.1, { opacity: [0, 0.78] }, 'inOut');
        else cls(tag, 'lost', t);
      });
    });
    anim('.pn-loop-reveal', P('pain-2', 0.6), 1.4, { draw: [0, 1] }, 'inOut');
    pop('.pn-loop-label', P('pain-2', 0.72));
    // pain-3: the old chain steps back; the direct loop takes over.
    anim('.pn-before', P('pain-3', 0), 0.6, { opacity: [1, 0.42] });
    show('.pn-after .pn-section', P('pain-3', 0.02));
    show('.pn-me', P('pain-3', 0.08));
    fadeIn('.pn-link', P('pain-3', 0.16));
    show('.pn-agent', P('pain-3', 0.22));
    stagger('.pn-after .pn-tag', P('pain-3', 0.3), 0.08, 'pop');
    fadeIn('.pn-cycle', P('pain-3', 0.28));
    const stopEls = root.querySelectorAll('.pn-stop');
    const beats = [0.28, 0.34, 0.47, 0.57, 0.66, 0.72, 0.8, 0.88, 0.96].map((f) => P('pain-3', f));
    beats.forEach((t, index) => cls(stopEls[index % 4], 'on', t, beats[index + 1] ?? Infinity));
    stagger('.pn-gain', P('pain-3', 0.66), P('pain-3', 0.1) - P('pain-3', 0));
  });

  Scene('s02-ontology', { title: 'Item Ontology', tag: '架构示意', tagKind: '' }, ({ root, S, E, show, anim, pop, stagger, slideIn, fadeIn }) => {
    const layers = [
      ['box', 'Business Objects', '业务对象', 'Inventory · LPN · Inventory Issue · Task · Order'],
      ['workflow', 'Business Processes', '业务流程', 'Receiving · Put Away · Pick · Replenish · Count'],
      ['scale', 'Business Rules', '业务规则', 'Inventory Key · Allocation · Goods Condition'],
      ['sliders', 'Business Configurations', '业务配置', 'Put Away Strategy · Facility Settings'],
      ['code', 'API Endpoints', '业务接口', 'Operations · Permissions · Request / Response Schemas'],
      ['cpu', 'Engineering', '工程知识', 'GenUI Runtime · Views · Permissions · Audit'],
    ];
    const routes = ['POST /inventory/inventory-issue', 'POST /inventory/inventory-issue/search', 'POST /ops/genui-task-type/{id}/tasks', 'POST /mobile/composable-step/…/take'];
    const skills = ['wms-api', 'wms-flows', 'wms-workflow', 'wms-settings', 'genui-task-pages', 'build-wms-extension'];
    const groups = [
      ['layers', '交互容器', 'Surfaces', [['Dynamic Card', '对话里的轻量交互'], ['Dynamic Task', '手机端沉浸式任务'], ['Dynamic Page', 'Web 工作台 / 查询页']]],
      ['puzzle', '组合积木', 'Building Blocks', [['Declarative UI', '扫描 · 输入 · 表格 · 图表 · 操作，JSON 声明'], ['Composable Step', 'Move Inventory = Take → Place'], ['Dynamic View API', '只读 TypeScript · Wasm 沙箱']]],
      ['database', '持久化', 'Data', [['Header · Lines · Records', 'Task 与 Custom Object 共用三层存储'], ['Custom Object', '长期保存的客户数据，有自己的状态流转'], ['业务事实', '仍走 WMS 业务接口']]],
      ['rocket', '发布治理', 'Lifecycle', [['Draft → Trial → Published', '人确认后才发布'], ['Versions', '进行中的任务跟随新版本'], ['Export / Import', '测试 → 生产，导入为草稿']]],
    ];
    // One header style for the three knowledge cards so their titles line up.
    const cardHead = (ic, title, sub) => `
      <div style="display:flex;align-items:center;gap:12px">${icon(ic, 30, 'var(--primary)')}<div><div style="font-size:26px;font-weight:800;line-height:1.2">${title}</div><div style="font-size:16px;color:var(--muted)">${sub}</div></div></div>`;
    root.innerHTML = `
      ${chapter('Part 1 · AI Native', 'Agent 长在 WMS 内部，用 Item Ontology 理解业务')}
      <div class="top" style="position:absolute;inset:0;transform-origin:960px 520px">
      <div class="onto card" style="position:absolute;left:96px;top:240px;width:648px;height:560px;padding:24px 26px;display:flex;flex-direction:column">
        ${cardHead('brain', 'Item Ontology', 'WMS 业务本体 · 随系统演进持续更新')}
        <div style="flex:1;margin-top:16px;display:flex;flex-direction:column;justify-content:space-between">
        ${layers.map(([ic, en, cn, ex]) => `
          <div class="layer" style="display:flex;gap:14px;align-items:center;padding:9px 14px;border-radius:12px;background:var(--raised)">
            <div style="width:44px;height:44px;border-radius:10px;background:#fff;display:grid;place-items:center;color:var(--primary)">${icon(ic, 24)}</div>
            <div><div style="font-size:19px;font-weight:700">${cn} <span style="font-weight:500;color:var(--muted);font-size:16px">${en}</span></div><div style="font-size:15.5px;color:var(--secondary)">${ex}</div></div>
          </div>`).join('')}
        </div>
      </div>
      <svg class="link-l" style="position:absolute;left:744px;top:510px;overflow:visible" width="116" height="20"><path d="M0 10 H116" stroke="#8b74c9" stroke-width="3" stroke-linecap="round" fill="none"/></svg>
      <svg class="link-r" style="position:absolute;left:1060px;top:400px;overflow:visible" width="116" height="290"><path d="M0 120 H58 M116 0 H70 Q58 0 58 12 V278 Q58 290 70 290 H116" stroke="#8b74c9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
      <div class="agent card" style="position:absolute;left:860px;top:400px;width:200px;height:240px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1.5px solid var(--primary-line);box-shadow:0 18px 44px rgba(85,53,160,.18)">
        <div style="width:104px;height:104px;display:grid;place-items:center">${UI.agentMark(96, 'var(--primary)', 1.2)}</div>
        <div style="margin-top:14px;font-size:21px;font-weight:800;white-space:nowrap">Item WMS Agent</div>
        <div style="margin-top:4px;font-size:15px;color:var(--muted);white-space:nowrap">理解 · 规划 · 生成</div>
      </div>
      <div class="api card" style="position:absolute;left:1176px;top:240px;width:648px;height:320px;padding:24px 26px;display:flex;flex-direction:column">
        ${cardHead('list', 'Operation &amp; API Catalog', '1,311 个接口操作 · 权限 · 规则在后端还是界面')}
        <div style="flex:1;margin-top:16px;display:flex;flex-direction:column;justify-content:space-between">${routes.map((r) => `<span class="chip code route" style="font-size:15.5px;padding:8px 14px">${r}</span>`).join('')}</div>
      </div>
      <div class="skills card" style="position:absolute;left:1176px;top:580px;width:648px;height:220px;padding:24px 26px;display:flex;flex-direction:column">
        ${cardHead('book', '内部 Skills', 'Agent 的工作手册 · 流程 · 接口 · 页面写法')}
        <div style="flex:1;margin-top:16px;display:flex;flex-wrap:wrap;gap:10px;align-content:flex-start">${skills.map((sk) => `<span class="chip code skill" style="font-size:15px;padding:6px 12px">${sk}</span>`).join('')}</div>
      </div>
      </div>
      <div class="top2" style="position:absolute;inset:0">
        <div class="card" style="position:absolute;left:96px;top:228px;width:680px;height:236px;padding:20px 22px">
          <div style="display:flex;align-items:center;gap:10px">${icon('brain', 24, 'var(--primary)')}<span style="font-size:21px;font-weight:800">Item Ontology</span><span style="font-size:15px;color:var(--muted)">WMS 业务本体</span></div>
          <div style="margin-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
            ${layers.map(([ic, en, cn]) => `<div style="display:flex;align-items:center;gap:12px;padding:15px 14px;border-radius:12px;background:var(--raised)"><div style="width:38px;height:38px;flex:none;border-radius:9px;background:#fff;display:grid;place-items:center;color:var(--primary)">${icon(ic, 19)}</div><div style="min-width:0"><div style="font-size:16.5px;font-weight:700">${cn}</div><div style="font-size:12.5px;color:var(--muted);white-space:nowrap">${en}</div></div></div>`).join('')}
          </div>
        </div>
        <svg style="position:absolute;left:776px;top:336px;overflow:visible" width="84" height="20"><path d="M0 10 H84" stroke="#8b74c9" stroke-width="3" stroke-linecap="round" fill="none"/></svg>
        <svg style="position:absolute;left:1060px;top:284px;overflow:visible" width="84" height="124"><path d="M0 62 H42 M84 0 H54 Q42 0 42 12 V112 Q42 124 54 124 H84" stroke="#8b74c9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
        <div class="card" style="position:absolute;left:860px;top:228px;width:200px;height:236px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1.5px solid var(--primary-line);box-shadow:0 18px 44px rgba(85,53,160,.16)">
          <div style="width:84px;height:84px;display:grid;place-items:center">${UI.agentMark(78, 'var(--primary)', 1.3)}</div>
          <div style="margin-top:14px;font-size:19px;font-weight:800;white-space:nowrap">Item WMS Agent</div>
          <div style="margin-top:2px;font-size:14px;color:var(--muted)">理解 · 规划 · 生成</div>
        </div>
        <div class="card" style="position:absolute;left:1144px;top:228px;width:680px;height:112px;padding:18px 22px">
          <div style="display:flex;align-items:center;gap:10px">${icon('list', 22, 'var(--primary)')}<span style="font-size:19px;font-weight:800">Operation &amp; API Catalog</span><span style="font-size:14.5px;color:var(--muted)">1,311 个接口操作 · 权限 · 规则位置</span></div>
          <div style="margin-top:12px;display:flex;gap:8px">${[routes[0], routes[2]].map((r) => `<span class="chip code" style="font-size:13.5px;padding:5px 10px">${r}</span>`).join('')}</div>
        </div>
        <div class="card" style="position:absolute;left:1144px;top:352px;width:680px;height:112px;padding:18px 22px">
          <div style="display:flex;align-items:center;gap:10px">${icon('book', 21, 'var(--primary)')}<span style="font-size:19px;font-weight:800">内部 Skills</span><span style="font-size:14.5px;color:var(--muted)">流程 · 接口 · 页面写法</span></div>
          <div style="margin-top:12px;display:flex;gap:8px">${skills.slice(0, 5).map((sk) => `<span class="chip code" style="font-size:13.5px;padding:5px 10px">${sk}</span>`).join('')}</div>
        </div>
      </div>
      <div class="link-d" style="position:absolute;left:958.5px;top:464px;width:3px;height:92px;background:#8b74c9"></div>
      <div class="gpanel" style="position:absolute;left:96px;top:556px;width:1728px;height:384px;border-radius:20px;background:linear-gradient(180deg, #f1edfa, #f8f6fd);border:1px solid var(--primary-line);padding:22px 26px">
        <div style="display:flex;align-items:center;gap:16px">
          <div style="width:50px;height:50px;border-radius:14px;background:var(--primary);color:#fff;display:grid;place-items:center;box-shadow:0 8px 18px rgba(85,53,160,.25)">${icon('layers', 26)}</div>
          <div><div style="font-size:27px;font-weight:800;color:var(--primary);line-height:1.15">GenUI 架构</div><div style="margin-top:3px;font-size:16.5px;color:var(--secondary)">生成式界面 · Agent 在 WMS 内构建应用的积木：不写新服务、不建表、不绕过权限</div></div>
          <div class="out pill primary" style="margin-left:auto;font-size:17px;padding:8px 18px;background:#fff">${icon('checkCircle', 18)} 生成物从一开始就符合 WMS 约定</div>
        </div>
        <div style="margin-top:20px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
          ${groups.map(([ic, cn, en, items]) => `
            <div class="gcol" style="padding:18px 20px 16px;border-radius:14px;background:#fff;border:1px solid #e6e0f4">
              <div style="display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--line)">
                <div style="width:36px;height:36px;border-radius:10px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center">${icon(ic, 20)}</div>
                <div style="font-size:19px;font-weight:800">${cn}</div><div style="margin-left:auto;font-size:13.5px;color:var(--muted);letter-spacing:.3px">${en}</div>
              </div>
              ${items.map(([name, desc]) => `<div style="margin-top:12px"><div style="font-size:16.5px;font-weight:700;color:var(--strong)">${name}</div><div style="margin-top:1px;font-size:14.5px;color:var(--secondary)">${desc}</div></div>`).join('')}
            </div>`).join('')}
        </div>
      </div>`;
    show('.onto', S('onto-1', 2.2), 0.6);
    stagger('.layer', S('onto-1', 4.0), 0.7, 'slideIn');
    pop('.agent', S('onto-1', 0.2), 0.6);
    anim('.link-l', S('onto-1', 8.5), 0.6, { clip: [0, 100] });
    show('.api', S('onto-2', 0.4));
    stagger('.route', S('onto-2', 1.6), 0.35, 'slideIn');
    show('.skills', S('onto-2', 4.5));
    stagger('.skill', S('onto-2', 5.0), 0.15, 'pop');
    anim('.link-r', S('onto-2', 7.0), 0.6, { clip: [0, 100] });
    // onto-3: the large knowledge cards give way to a compact strip at full type size, so the GenUI architecture
    // gets the lower half of the stage without shrinking anything into a thumbnail.
    const z = S('onto-3', 0);
    anim('.top', z, 0.35, { opacity: [1, 0], scale: [1, 0.97] }, 'in');
    show('.top2', z + 0.32, 0.55, 16);
    anim('.link-d', z + 0.9, 0.5, { clipY: [0, 100] });
    show('.gpanel', z + 0.8, 0.6, 30);
    root.querySelectorAll('.gcol').forEach((el, i) => pop(el, z + [2.8, 4.1, 5.6, 7.1][i]));
    pop('.out', z + 9.8);
  });

  Scene('s03-permission', { title: '权限模型', tag: '架构示意' }, ({ root, segs, S, show, anim, pop, fadeIn, cls }) => {
    const P = (segId, fraction) => (segs[segId] ? segs[segId].start + fraction * (segs[segId].end - segs[segId].start) : 0);
    // Three requests leave the Agent; the gate judges each by Quinn's own role permissions (RBAC)
    // and by which data and objects are Quinn's (facility grants, task assignment).
    const requests = [
      { cls: 'ok', path: 'POST …/TDEF-151/tasks', code: '201 Created', desc: '创建 Move Damage 任务 · 在 Quinn 的权限内', at: 0.02, lights: '.rb-yes' },
      { cls: 'no', path: 'PATCH …/facility-setting/:id', code: '403 Forbidden', desc: '修改仓库设置 · 角色没有这个权限', at: 0.3, lights: '.rb-no' },
      { cls: 'no', path: 'POST …/TASK-18652/records', code: '403 notAssignee', desc: '任务指派给 Maria Garcia，不是 Quinn', at: 0.52, lights: '.dac-task' },
    ];
    const LANES = [492, 578, 664];
    const perm = (cls, kind, html) => `<div class="pm-perm ${kind} ${cls}">${icon({ yes: 'check', no: 'x', rule: 'lock' }[kind], 16, 'currentColor', kind === 'rule' ? 2.2 : 3)}${html}</div>`;
    root.innerHTML = `
      ${chapter('Part 1 · 权限模型', 'Agent 代表用户办事，权限上限就是用户本人')}
      <div class="card pm-user">
        <div class="pm-col pm-id"><div class="pm-row">${icon('user', 26)}<div><div class="pm-name">Quinn Chen</div><div class="pm-sub">Supervisor · Valley View</div></div></div></div>
        <div class="pm-col">
          <div class="pm-col-h">角色权限 · <b>RBAC</b><span>能调用哪些接口</span></div>
          ${perm('rb-yes', 'yes', '<span class="mono">ops/genui-task:write</span>')}
          ${perm('rb-no', 'no', '<span class="mono">master-data/setting:write</span><em>未授予</em>')}
        </div>
        <div class="pm-col">
          <div class="pm-col-h">数据与对象 · <b>DAC</b><span>能碰哪些数据</span></div>
          ${perm('dac-facility', 'rule', '仓库授权：Valley View<em>其他仓库不可见</em>')}
          ${perm('dac-task', 'rule', '任务归属：只执行指派给本人的任务')}
        </div>
      </div>
      <div class="pm-delegate"><span class="pill primary">${icon('key', 15)} 委托 · 同一个 WMS 令牌</span></div>
      <div class="card pm-agent">
        <div class="pm-row">${icon('sparkles', 26)}<div><div class="pm-name">Item WMS Agent</div><div class="pm-sub">以 Quinn 本人的身份调用接口</div></div></div>
      </div>
      ${LANES.map((y) => `<div class="pm-lane" style="top:${y}px"></div><div class="pm-lane out" style="top:${y}px"></div>`).join('')}
      ${requests.map((r, i) => `<div class="pm-req ${r.cls} r${i} mono" style="top:${LANES[i]}px">${r.path}</div>`).join('')}
      <div class="card pm-gate">
        <div class="pm-gate-icon">${icon('shield', 30)}</div>
        <div class="pm-name">WMS API</div>
        <div class="pm-sub">角色权限校验<br>仓库隔离 · 任务归属</div>
        <div class="pm-gate-note">按 Quinn 本人判定</div>
      </div>
      ${requests.map((r, i) => `
        <div class="card pm-result ${r.cls} res${i}" style="top:${LANES[i]}px">
          <span class="pm-badge">${icon(r.cls === 'ok' ? 'check' : 'x', 18, '#fff', 3)}</span>
          <div><div class="pm-code">${r.code}</div><div class="pm-sub">${r.desc}</div></div>
        </div>`).join('')}
      <div class="audit card" style="position:absolute;left:96px;top:756px;width:1728px;padding:0;overflow:hidden">
        <div style="padding:12px 20px;background:var(--section);font-weight:700;font-size:17px;display:flex;gap:10px;align-items:center">${icon('history', 18)} 数据变更日志 · Data Change Log</div>
        <div class="mono" style="display:grid;grid-template-columns:230px 160px 260px 110px 1fr;padding:12px 20px;font-size:16px;color:var(--muted);border-bottom:1px solid var(--line)"><span>changed_at</span><span>user</span><span>object</span><span>op</span><span>screen_id</span></div>
        <div class="arow mono" style="display:grid;grid-template-columns:230px 160px 260px 110px 1fr;padding:12px 20px;font-size:16px"><span>10/27/2026 10:31:08</span><span>Quinn Chen</span><span>Dynamic Task</span><span>INSERT</span><span style="color:var(--primary);font-weight:700">page:damaged-inventory-relocation@v1</span></div>
      </div>`;

    // perm-1: who acts for whom.
    show('.pm-user', P('perm-1', 0.05));
    fadeIn('.pm-delegate', P('perm-1', 0.4));
    show('.pm-agent', P('perm-1', 0.5));
    show('.pm-gate', P('perm-1', 0.75));
    fadeIn('.pm-lane', P('perm-1', 0.75));
    // perm-2: one request inside Quinn's permissions goes through; one beyond the role and one on
    // someone else's task stop flush against the gate (lane start 596 + pill 300 + 8 gap; gate at 1060).
    const travel = 1.6, STOP = 156;
    requests.forEach((r, i) => {
      const t = P('perm-2', r.at), pill = `.pm-req.r${i}`;
      anim(pill, t, 0.3, { opacity: [0, 1] });
      cls(r.lights, 'lit', t, r.cls === 'ok' ? P('perm-2', requests[1].at) : Infinity);
      if (r.cls === 'ok') {
        anim(pill, t, travel, { x: [0, 420] }, 'inOut');
        anim(pill, t + travel - 0.25, 0.25, { opacity: 0 });
        pop(`.res${i}`, t + travel);
      } else {
        anim(pill, t, travel, { x: [0, STOP] }, 'inOut');
        [-16, 10, -6, 0].reduce((at, dx) => anim(pill, at, 0.08, { x: STOP + dx }), t + travel);
        cls(pill, 'denied', t + travel);
        pop(`.res${i}`, t + travel + 0.2);
      }
    });
    // perm-3: every write is on the record.
    show('.audit', S('perm-3', 0.2));
    show('.arow', S('perm-3', 1.6));
  });
})();
