"""Restyle the supplied model review using the workshop's native slide layout."""
from copy import deepcopy
from html import escape
from pathlib import Path
import importlib.util
import json
import re

from lxml import html, etree

ROOT = Path(__file__).resolve().parent
DECK = ROOT / 'slides-source/detailed'
ATTACHMENT = Path('/Users/wutengyue/Library/Containers/com.tencent.WeWorkMac/Data/Documents/Profiles/ECD717F935BE7A3BDFB976DBCFB97B01/Caches/Files/2026-10/7b5a3e363ece234c07959768f7e9245d/自建模型VSLLM.html')

CSS = '''
*{box-sizing:border-box;margin:0;padding:0}
.en{display:none!important}html[data-lang=en] .zh{display:none!important}html[data-lang=en] .en{display:revert!important}
.slide-container{width:1280px;min-height:720px;background:var(--bg,#f6f7f9);color:var(--ink,#152439);font-family:Inter,"Noto Sans SC",Arial,sans-serif}
.failure-page{margin:42px 60px 28px;min-height:650px;display:flex;flex-direction:column;letter-spacing:0}
.failure-page header{border-top:4px solid var(--accent,#007f86);padding-top:13px}
.failure-page .kicker{font:700 12px/1.4 monospace;color:var(--accent,#007f86);letter-spacing:0!important}
.failure-page h1{font-size:36px!important;line-height:1.2!important;margin:10px 0 12px!important;font-weight:750;letter-spacing:0!important}
.failure-page .lead{font-size:18px!important;line-height:1.5!important;color:var(--muted,#52647b)!important;margin:0!important}
.failure-page .failure-body{flex:1;padding-top:24px;min-width:0}
.failure-page .sec{font-size:18px;line-height:1.3;font-weight:700;margin-bottom:14px}
.failure-page .pano{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:22px;margin-bottom:24px}
.failure-page .pano-step{border-top:2px solid var(--ink,#152439);padding-top:10px;min-width:0}
.failure-page .ps-stage{font:700 14px/1.3 monospace;color:var(--accent,#007f86)}
.failure-page .ps-exp{font-size:21px;line-height:1.3;font-weight:700;margin:8px 0}
.failure-page .ps-act{font-size:17px;line-height:1.5;color:var(--muted,#52647b)}
.failure-page .valid{display:grid;grid-template-columns:1.25fr 1fr;gap:36px;border-top:1px solid var(--line,#d9e1e8);padding-top:12px}
.failure-page .vr{display:grid;grid-template-columns:150px 1fr 45px;gap:12px;align-items:center;margin:12px 0;font-size:17px;line-height:1.4}
.failure-page .vr-b{height:12px;background:var(--line,#d9e1e8)}
.failure-page .vb{height:100%;background:var(--accent,#007f86)}
.failure-page .bc-y{background:#bd8a3c}.failure-page .bc-r{background:#bb6767}.failure-page .bc-b{background:#8396a8}
.failure-page .vr-p{font-weight:700;text-align:right}
.failure-page .sample-note{font-size:13px;line-height:1.5;color:var(--muted,#52647b);margin-top:12px}
.failure-page .vnote{border-left:1px solid var(--line,#d9e1e8);padding:4px 0 0 28px}
.failure-page .finding-number{font-size:64px;font-weight:750;line-height:1.1;color:var(--accent,#007f86)}
.failure-page .finding-label{font-size:21px;line-height:1.4;font-weight:700;margin:3px 0 14px}
.failure-page .vn-r{font-size:17px;line-height:1.5;margin-top:9px}
.failure-page .quad-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px}
.failure-page .quad{border-top:2px solid var(--ink,#152439);padding-top:10px;min-width:0}
.failure-page .quad-hdr{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:15px;gap:8px}
.failure-page .qh-name{font-size:21px;font-weight:700;line-height:1.3}.failure-page .qh-count{font-size:13px;color:var(--muted,#52647b);white-space:nowrap}
.failure-page .qi{display:grid;grid-template-columns:25px minmax(0,1fr);gap:6px;padding:7px 0;border-top:1px solid var(--line,#d9e1e8)}
.failure-page .qi-badge{font:700 12px/1.3 monospace;color:var(--accent,#007f86);margin-bottom:4px}
.failure-page .qi-title{font-size:17px;font-weight:700;line-height:1.4;margin-bottom:4px}
.failure-page .qi-desc{font-size:14px;line-height:1.4;color:var(--muted,#52647b)}
.failure-page .route-table{table-layout:fixed;border-collapse:collapse;width:100%;font-size:17px}
.failure-page .route-table th{font-size:19px;padding:12px 16px!important;border-top:2px solid var(--ink,#152439);border-bottom:1px solid var(--line,#d9e1e8);text-align:left}
.failure-page .route-table th:first-child{width:17%}.failure-page .route-table th:not(:first-child){width:41.5%}
.failure-page .route-table td{vertical-align:top;padding:12px 16px!important;border-bottom:1px solid var(--line,#d9e1e8);font-size:17px;line-height:1.5}
.failure-page .route-table th:last-child,.failure-page .route-table td:last-child{background:var(--soft,#eaf0f4)}
.failure-page .route-table strong{display:block;font-size:17px;line-height:1.5;margin-bottom:3px}
.failure-page .route-detail{display:block;font-size:15px;line-height:1.5;color:var(--muted,#52647b)}
.failure-page .takeaway{margin-top:20px;padding:13px 17px;background:var(--soft,#eaf0f4);border-top:1px solid var(--line,#d9e1e8);font-size:17px;line-height:1.5}
.failure-page .takeaway b{color:var(--accent,#007f86);margin-right:14px}
.failure-page .foot{margin-top:18px;padding-top:12px;display:flex;justify-content:space-between;gap:20px;font-size:12px;color:var(--muted,#52647b);border-top:1px solid var(--line,#d9e1e8)}
'''


def elements(node, name):
    return node.xpath('.//*[contains(concat(" ", normalize-space(@class), " "), $needle)]', needle=f' {name} ')


def markup(node):
    return etree.tostring(node, encoding='unicode', method='html')


def scope_css(css, page_id):
    # Native styles here contain only flat rules, without nested at-rules.
    def scope(match):
        selectors = []
        for selector in match[1].strip().split(','):
            selector = selector.strip()
            if selector.startswith('html'):
                root, descendant = selector.split(' ',1)
                selectors.append(f'{root} #{page_id} {descendant}')
            else:
                selectors.append(f'#{page_id} {selector}')
        return ','.join(selectors)+'{'+match[2]+'}'
    return re.sub(r'([^{}]+)\{([^{}]*)\}',scope,css)


def render(number, title, en, lead, body, takeaway):
    ref = 'D1.2.8.3'
    closing = f'<div class="takeaway"><b>复盘</b>{takeaway}</div>' if takeaway else ''
    return f'''<!DOCTYPE html>
<html lang="zh-CN" data-lang="zh"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="slide-container"><div class="page-inner failure-page">
<header><div class="kicker">DAY 1 / MD §{ref} / <span class="zh">自建模型实验复盘</span><span class="en">Self-built model experiment review</span></div>
<h1><span class="zh">{title}</span><span class="en">{en}</span></h1><p class="lead">{lead}</p></header>
<main class="failure-body">{body}</main>
{closing}
<footer class="foot"><span>ITEM × COO AI Team × ISS Biz (team)</span><span>R5 · MD §{ref}</span></footer>
</div></div></body></html>'''


def generate():
    doc = html.fromstring(ATTACHMENT.read_text(encoding='utf-8'))
    first = deepcopy(doc.get_element_by_id('s1'))
    pano = elements(first,'pano')[0]
    pano.attrib.pop('style',None)
    for node in elements(pano,'pano-arr'):
        node.getparent().remove(node)
    bars = elements(first,'vbars')[0]
    note = bars[-1]
    note.attrib.clear()
    note.set('class','sample-note')
    evidence = markup(bars)
    body = markup(pano) + '<div class="sec">CSR 人工核验：158 封随机邮件，逐一核查</div><div class="valid">' + evidence + '<section class="vnote"><div class="finding-number">9%</div><div class="finding-label">输出可直接使用</div><div class="vn-r">正确回复仅来自 <strong>Pickup</strong> 单一场景。</div><div class="vn-r"><strong>91%</strong> 的输出不可直接使用；<strong>53%</strong> 本不需要回复，却触发了模型回复。</div></section></div>'
    (DECK/'r5_c09_08.html').write_text(render(8,'自建模型实验：目标、过程与验证结果','Private model experiment: process and results','2024.08–2025.04，物流客服邮件自动化实验，目标是无需人工介入直接回复客户。',body,'意图识别、业务执行与回复质量，需要分别验收。'),encoding='utf-8')

    grid = deepcopy(elements(doc.get_element_by_id('s2'),'quad-grid')[0])
    concise = [
        ('样本覆盖不足','每类约 100 条样本，难覆盖训练分布外表达。'),
        ('新类别干扰旧类别','小样本类别加入全局训练，可能降低已有类别准确率。'),
        ('标注边界不统一','各方分类口径不一致，产生矛盾标签。'),
        ('邮件上下文丢失','孤立标注和回复链切割，丢失语义或混入历史。'),
        ('隐性业务知识缺失','BillTo、客户身份等判断依据不在邮件正文中。'),
        ('识别与执行断层','槽位、API 编排、状态和回复需另建执行系统。'),
        ('分布外泛化不足','新表达容易识别失败，运行错误不会自动修正。'),
        ('意图与系统错位','客户语言分类与内部系统功能边界不同。'),
        ('语言与字段脱节','“standard pallet”到尺寸字段需要领域映射。'),
        ('标注能力难规模化','人员需同时理解业务逻辑与统一的数据定义。'),
        ('数据反馈链中断','生产宕机影响邮件处理，也切断后续训练数据。'),
        ('维护成本持续上升','新场景需重新采集、标注、训练，并回归旧场景。'),
        ('接口调用方式不匹配','面向人工表单的接口，需要参数与容错适配。'),
        ('执行层缺位','识别后无接口可执行，只能返回预设数据或固定回复。'),
    ]
    for item,(title,desc) in zip(elements(grid,'qi'),concise):
        elements(item,'qi-title')[0].text = title
        node = elements(item,'qi-desc')[0]
        for child in list(node):
            node.remove(child)
        node.text = desc
    for node in elements(grid,'qh-dot'):
        node.getparent().remove(node)
    (DECK/'r5_c09_09.html').write_text(render(9,'自建私有模型的 14 个技术限制','14 technical limits of the private model','本次实验的断点分为四层，需结合具体业务任务逐项判断适用边界。',markup(grid),''),encoding='utf-8')

    rows = [
        ('知识与泛化','依赖本次标注数据','每类约 100 条，训练分布外表达覆盖不足。','预训练提供语言基础','业务知识通过上下文、检索或工具补充，仍需评测。'),
        ('上下文与隐性知识','邮件孤立处理','历史对话、BillTo、客户身份需额外建模。','可结合历史与外部事实','上下文承接对话，工具查询补充业务信息。'),
        ('识别到执行','另建任务执行系统','分类器之外，还需槽位、编排、状态与回复生成。','模型配合工具执行','工具调用仍依赖可用接口、权限、校验及人工接管。'),
        ('新场景扩展','重新标注、训练与回归','小样本新类别可能影响已有分类效果。','调整知识、提示与工具','可缩短试验周期，变更后仍需回归验证。'),
        ('场景与选型','稳定、明确的专域任务','需要充分数据、可控分类边界及持续维护能力。','多变语言与多轮任务','可评估客服、文档等场景；部署与成本另行比较。'),
    ]
    body = '<table class="route-table"><thead><tr><th>比较维度</th><th>本次自建 NLP 方案</th><th>LLM 与工具集成路线</th></tr></thead><tbody>'
    for dimension,a,ad,b,bd in rows:
        body += f'<tr><td>{escape(dimension)}</td><td><strong>{escape(a)}</strong><span class="route-detail">{escape(ad)}</span></td><td><strong>{escape(b)}</strong><span class="route-detail">{escape(bd)}</span></td></tr>'
    body += '</tbody></table>'
    (DECK/'r5_c09_10.html').write_text(render(10,'自建模型与 LLM：两种路线的能力边界','Private NLP and LLM: capability boundaries','结合本次客服实验比较技术路线，按业务任务判断泛化、上下文与执行能力。',body,'以同一任务、同一评测集比较质量与全生命周期成本，再决定技术路线。'),encoding='utf-8')


def sync():
    spec = importlib.util.spec_from_file_location('refresh', ROOT/'.refresh_r5_outputs.py')
    refresh = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(refresh)
    manifest_path = ROOT/'source/detailed_manifest.json'
    meta = json.loads(manifest_path.read_text(encoding='utf-8'))
    overview = 'r5_c09_00'
    if not any(p['id']==overview for p in meta['pages']):
        index = next(i for i,p in enumerate(meta['pages']) if p['id']=='r5_c09_01')
        page = dict(meta['pages'][index],id=overview,md='D1.2.8',refs=['D1.2.8'],title='其他踩过的坑：',en='Other failure patterns:')
        meta['pages'].insert(index,page)
    ids = [overview,'r5_c09_08','r5_c09_09','r5_c09_10']
    path = ROOT/'Item_ISS_Meeting_R5.html'
    text = path.read_text(encoding='utf-8')
    if f'<section class="scene" id="{overview}"' not in text:
        raise ValueError('Generate the overview scene before styling the model-review pages')
    for page in meta['pages']:
        if page['id'] not in ids:
            continue
        source = (DECK/(page['id']+'.html')).read_text(encoding='utf-8')
        doc = html.fromstring(source)
        if page['id'] != overview:
            page['title'] = elements(doc,'zh')[0].text_content()
            page['en'] = elements(doc,'en')[0].text_content()
        start = text.index(f'<section class="scene" id="{page["id"]}"')
        slide_start = text.index('<div class="slide-container">',start)
        slide_end = refresh.matching_div_end(text,slide_start)
        native_start = source.index('<div class="slide-container">')
        native_end = refresh.matching_div_end(source,native_start)
        text = text[:slide_start]+source[native_start:native_end]+text[slide_end:]
    for i,page in enumerate(meta['pages']):
        page.update(index=i,number=i+1,total=len(meta['pages']))
    text = refresh.rebuild_scenes(text, meta)
    text = refresh.inject_model_failure_css(text)
    text = re.sub(r'(<script id="page-data" type="application/json">).*?(</script>)',lambda m:m[1]+json.dumps(meta,ensure_ascii=False).replace('</','<\\/')+m[2],text,count=1,flags=re.S)
    path.write_text(text,encoding='utf-8')
    manifest_path.write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    rows = ['# 会中讨论版 · R5 MD对应','','|页|Day|MD|主题|','|---|---|---|---|']
    rows += [f'|{p["number"]}|{p["day"]}|{p["md"]}|{p["title"]}|' for p in meta['pages']]
    (ROOT/'docs/detailed_MD_Map_R5.md').write_text('\n'.join(rows)+'\n',encoding='utf-8')


if __name__ == '__main__':
    generate()
    sync()
