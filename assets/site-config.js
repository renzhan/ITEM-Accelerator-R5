/* 直接编辑本文件即可配置集中收集API与部署视频；不要在这里填写管理员密钥。 */
(function () {
  const script = document.currentScript;
  const base = script && script.src ? new URL('../', script.src).href : new URL('./', document.baseURI).href;
  window.ISS_CONFIG = {
    version: 'R5.0',
    siteBase: base,
    formsEndpoint: 'https://iss-r5-collection-api.tommyyula.workers.dev/api/submissions', // 例如 https://你的收集服务/api/submissions；为空时不假装提交。
    media: {
      c01: { src: '', poster: '', title: 'UNIS 港口拖柜', captions: '' },
      c02: { src: '', poster: '', title: 'ITEM WMS Dynamic Form', captions: '', player: 'media/c02-dynamic-forms/index.html' },
      c03: { src: '', poster: '', title: 'UNIS Rate & Quote', captions: '' },
      c04: { src: '', poster: '', title: 'ISS BO', captions: '' },
      c05: { src: '', poster: '', title: 'Record & Reply · FMS 客服工单演示', captions: '' }, // The c05 source slide uses the local MP4 player.
      c06: { src: '', poster: '', title: 'ISS CEC + Genesys', captions: '' },
      c08: { youtube: '', src: '', poster: '', title: 'iCEO 功能介绍', captions: '' }, // 功能介绍：填 YouTube 分享链接或 watch 链接。
      c08_cases: { youtube: '', src: '', poster: '', title: 'iCEO 成功案例与决策边界', captions: '' }, // 案例对照：独立更新第二段 YouTube 链接。
      c09: { src: '', poster: '', title: '其他踩过的坑', captions: '' }
    }
  };
  // src用根目录相对路径如 media/c01.mp4，或授权HTTPS链接；默认空字符串避免404。
  // player指向HTML播放器（场景动画＋旁白，非录屏），以iframe嵌入视频区；同时填写时player优先。
}());

// 若需要在站点内提供工程包下载，填入实际可访问的地址；不填时由组织者另行分享。
window.ISS_CONFIG.packageUrl = '';
