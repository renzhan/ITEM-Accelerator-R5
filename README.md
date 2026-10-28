# ISS AI Native Workshop · R5 关联HTML安装包

解压后从根目录的 `index.html` 进入。两套演示、完整MD、表单、资料和讨论记录的链接已经连好。主持人为Tom；会前版16页，会中版142页。八例展开，其中D1.2.5 Record & Reply按理念、实现、合规、复用和现场演示共六页；其余按七段展开，其中D1.2.9.2根据Knowledge Fabric源材料拆为两页，D1.2.9另加一页WMS真实样例，并保留完整原细节。Day2按目标蓝图、差距、路线图、IP/商业化和最终收敛组织，原六业务域、能力资产、组织、风险与七阶段材料仍可取用。

## 1. 本机打开

双击 `Item_ISS_PreRead_R5.html` 或 `Item_ISS_Meeting_R5.html` 可直接查看，无需构建。为使跨页本机存储、链接和视频行为更一致，建议在解压根目录运行：

```bash
python3 -m http.server 8080
```

打开 `http://localhost:8080/`。这是本机静态服务，不是公网或集中收集服务。离线表单可以保存草稿并导出；未配置API时不会冒充在线提交。不同浏览器对file://存储的处理可能不同，请导出备份。

## 2. 推到GitHub并发布Pages

先确定本仓库和Pages内容有权公开。不要把客户个人数据、实际提交记录、生产凭证、未授权录屏或管理员密钥推入Git。Pages可能公开可访问，即使对应仓库是私有；需要企业访问控制时请使用受控托管，不把“私有仓库”当作站点认证。

将解压根目录文件放进目标仓库，而不是再包一层目录。保留 `.nojekyll`、`.github/workflows/pages.yml`。在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。包内工作流只上传静态页面、assets、docs、forms、media及两套入口，不上传backend、reference或source。推到 `main` 后查看 **Actions**；发布成功后以Pages给出的URL为准。

例如沿用 `tommyyula/item-ISS-demo`，项目入口通常是 `https://tommyyula.github.io/item-ISS-demo/`，两套HTML和表单都是项目子路径下的相对链接。本次没有替你创建仓库或上线。

不使用Actions时也可选择 **Deploy from a branch → main → /(root)**，根目录已有 `.nojekyll`，无需Jekyll构建。选择一种发布方式，不同时配置两个重复发布流程。

## 3. 放置八组预录视频

在 `media/` 放入已授权可分享的视频，编辑 `assets/site-config.js` 对应 `c01`–`c09` 的 `src`，例如：

```javascript
c01: { src: 'media/c01.mp4', poster: '', title: 'UNIS 港口拖柜', captions: '' }
```

路径相对**站点根目录**，不是相对assets目录。也可填有授权的HTTPS视频地址；需要跨域字幕时检查服务端授权。默认src为空，不会请求不存在的视频。页面上的“选择本机预录视频”只建立当前窗口的本机预览，不上传、不复制到Git，也不会在刷新后保留文件。

每个案例首个页面有视频区；标注真实/脱敏/模拟、授权、时长和录制日期。视频建议包含正常任务、异常/信息缺失、人工接管、状态回写和结果；不能仅用答复或调用日志证明业务完成。较大视频可用授权对象存储，避免将未脱敏原始录屏放到公共仓库。

## 4. 问题采集：本机与集中提交

`forms/prework.html` 和会前演示末页采集部门、人名、主题、痛点、现状、input材料/数据、期望实践、基线、断点、Owner。会末 `forms/convergence.html` 及会中末页采集优先场景、核心能力/护城河、共建方式及发起人/参与者/决策人、风险，附验收、执行边界、Owner、日期、推进状态和下一门。

**GitHub Pages不会存这些提交。** 先按 `backend/README.md` 部署包内的Cloudflare Worker＋D1，设置后端 `ADMIN_TOKEN` 和精确 `ALLOWED_ORIGINS`，执行schema，然后编辑：

```javascript
formsEndpoint: 'https://你的收集服务/api/submissions'
```

修改后刷新页面。API没有配置时在线提交禁用，草稿可本机保存并导出JSON/CSV；失败不会假报成功。真实成功必须收到服务器回执。修改已经提交的内容会生成新编号，避免旧回执被误认为新内容成功。

`backend/server.py` 是标准库SQLite本机参考API，可用于安装测试，不是无条件可公开的生产服务。集中记录查询/导出需要管理员Bearer凭证，凭证只放后端环境变量，不放site-config或公网HTML。公网生产还需按企业要求增加身份认证、反垃圾/节流、HTTPS、保留期限和正式安全审查。

`forms/records.html` 管理当前浏览器保存的回执/导入记录，不是组织集中数据库。草稿仍在对应表单页。当前表单可导出；后台集中汇总请按backend说明使用授权管理员导出。

## 5. 会中记录与页面取舍

第二天各页下方有可编辑讨论区：领导意见、结论/待补证据、Owner/下一步/日期，自动保存到本机。八案例页也可展开讨论区。记录不会自动上送，也不等同于正式审批。使用“资料/下载 → 导出讨论笔记”保存JSON，或每节导出Markdown；可重新导入JSON。

目录可以搜索、隐藏和恢复页面；隐藏不会删除正文或改原MD。配置可导出供另一个浏览器导入。中英/日夜、Day1/Day2/全部、滚动、固定翻页、键盘、全屏与本节MD定位保留。填写表单和笔记时方向键不会当作翻页。

## 6. 修改正文和页面

完整中文正文在 `Item_ISS_AI_Native_Workshop_R5.md` 和 `docs/`；在线阅读为 `docs/reader.html`。原生可编辑页在 `slides-source/brief/`、`slides-source/detailed/`；页序与对应在 `source/*_manifest.json`。正文和页面是两个阅读层：改MD不会凭空重写幻灯内容，需同步修改对应原生页。

修改完成后在根目录执行：

```bash
python3 -m pip install -r requirements.txt
python3 source/build_site.py --kind all
```

该命令重新组装，更新根目录静态页面和MD阅读文件，不依赖本次sandbox路径。不会调用LLM，也不会创作/改写原生页面。新增页需在manifest中登记id、day、chapter、refs并提供原生HTML。构建会检查全部MD对应锚点，缺页面或缺锚点时失败，而不是发布不完整版本。

背景R4材料保存在 `reference/` 与 `source/R4_Approved.md`，便于追溯；不是当前另一套议程。实际收益、组织调整、人员、真实接口与录屏由你补充，当前明确区分已有内容、建议设计和待补证据。

## 官方发布参考

- [GitHub Pages发布源设置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Pages自定义Actions工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

发布工作流采用官方示例当前列出的checkout v6、configure-pages v5、upload-pages-artifact v4、deploy-pages v4。版本验证于2026-10-26。

## 7. Agent 可信保障内嵌页

在会中版 `Item_ISS_Meeting_R5.html#r5_agent_assurance` 查看。该页紧接 D1.2.8.0 总览“其他踩过的坑：先定义可验收的业务结果”，位于 D1.2.8.1 之前，共用 MD §D1.2.8.0 编号，正文与本节 MD 链接同步对应。其余章节编号不变；会中版共 143 页。

页首、正文和页脚直接采用原生 `slide-container`、`page-inner`、`title-zone`、`kicker`、`lead`、`content`、`discussion`、`foot` 结构。正文的段落、列表与标题字号由公共 shell 控制；本页不覆盖外层高度、居中、页眉或页脚，不修改公共框架。矮屏沿用原生页面的纵向滚动行为。

进入本页先展示 102 秒开场视频，点击播放图标，结束后保留播放器、最后一帧和进度条，方便拖回回顾；点击右上角“进入讲解”再进入“01 统一标准”。讲解页的返回视频图标位于翻页按钮左侧，沿用相同矩形样式。首次进入默认暂停；返回视频时保留原进度并暂停，再次进入讲解保留所选 Tab。播放器沿用浏览器的暂停、进度、音量及全屏控制；离开本页或切到后台时暂停。视频原文件为 `media/attachments/agent-assuranc.mp4`，与 PDF 同目录；封面 `agent-assuranc-poster.jpg` 截自视频第 3 秒，视频保持 1440p、60fps 和原配音。页面加载时仅展示封面，点击后再加载视频。

四个画面依次为“统一标准 → 严谨测试 → 精准知识 → 可靠验收”。顶部步骤与公共 `.ctrl` 矩形翻页按钮共用一行，保持正常文档布局，不吸附、不悬浮。顶部步骤、按钮和横向滑动可切换；仅当前页使用左右方向键切换内部画面，在首尾边界沿用整套演示翻页，PageUp/PageDown 仍翻整套演示。视频和讲解区共用稳定的占位尺寸，窄屏工具栏保留相同的行高；四个画面等高；四页的底部说明条按同一基线对齐，沿用公共说明条的标签加粗、正文常规字重；采用约 420ms 的横向转场与内容淡入，正文不做上下位移，支持减少动态效果偏好。评估连线与门槛刻度按阅读顺序显现，百分比保持静态，底部说明条只淡入。局部 CSS 仅负责内部导航、轮播及图示布局。
原生页在 `slides-source/detailed/r5_agent_assurance.html`，局部样式和交互在 `assets/assurance.css`、`assets/assurance.js`。构建仅向包含该页的演示注入这些资源，不生成独立预览页。按第 6 节统一构建即可。

最后一个画面右下角的 PDF 小标打开 `media/attachments/industry-acceptance-standard-knowledge-and-agent.pdf`。附件沿用项目既有的 media 分发与打包流程；单独发送会中 HTML 时需同时保留该相对路径下的 PDF、视频与封面。独立审阅 HTML 内嵌视频、封面和 PDF，可离线单文件打开；审阅 ZIP 不再重复存放已内嵌的视频。会中画面保留人工与自动化量化测试、人工审核知识、第三方 Evaluation Agent 评估三项保障。测试页突出脚本批量执行、LLM 对照 Gold Set 核对及用例复用与持续回归，展示 PDF A1、A5、A12 的验收参考门槛；知识页放在第三个画面，为回答与评估提供依据；右侧为内联 SVG 细线网络示意图，末尾点出数据经审核与验证沉淀为语义确定性底座（Ontology）。图示不代表实际业务数据或系统拓扑，不依赖外部图片。评估页保留评估流程和人工复核，并用刻度标记 K4、K5、A7 的核验参考门槛；刻度不表示已测成绩。PDF 小标使用轮播下方共用的正常文档流位置，仅最后一个画面可见。PDF 中的建议门槛不是项目实测成绩。
