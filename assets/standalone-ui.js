(function () {
  const root = document.documentElement;
  try { root.dataset.lang = localStorage.getItem('iss-r5-language') || 'zh'; root.dataset.theme = localStorage.getItem('iss-r5-theme') || 'day'; } catch { root.dataset.theme = 'day'; }
  const nav = document.createElement('nav'); nav.className = 'standalone-controls';
  const style = document.createElement('style'); style.textContent = '.standalone-controls{position:sticky;top:0;z-index:20;display:flex;justify-content:flex-end;gap:9px;padding:10px 16px;border-bottom:1px solid var(--iss-line,#ccd9e4);background:var(--iss-panel,#fff)}.standalone-controls button{width:auto!important;font-size:14px!important;padding:7px 12px!important}'; document.head.appendChild(style);
  const lang = document.createElement('button'); lang.type = 'button'; lang.textContent = '中文 / EN'; const theme = document.createElement('button'); theme.type = 'button'; theme.textContent = 'Day / Night'; nav.append(lang, theme); document.body.prepend(nav);
  lang.onclick = () => { root.dataset.lang = root.dataset.lang === 'zh' ? 'en' : 'zh'; try { localStorage.setItem('iss-r5-language', root.dataset.lang); } catch {} };
  theme.onclick = () => { root.dataset.theme = root.dataset.theme === 'day' ? 'night' : 'day'; try { localStorage.setItem('iss-r5-theme', root.dataset.theme); } catch {} };
}());
