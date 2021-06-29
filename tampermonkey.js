// ==UserScript==
// @name   知乎浏览助手
// @namespace    http://tampermonkey.net/
// @version      0.0.6
// @description 知乎浏览助手. 如果想报 bug, 可以通过知乎私信联系我, zhihu.com/people/kougazhang
// @author        kgzhang
// @match        https://www.zhihu.com/*
// @grant        GM_addStyle
// @grant        GM_log
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @run-at       document-end
// ==/UserScript==

// 问题页加宽
GM_addStyle(".Question-mainColumn { width: unset !important; } ");
GM_addStyle(".QuestionAnswers-answers { width: 1000px !important; } ");
// 推荐页加宽
GM_addStyle(".Topstory-mainColumn { width: 1000px !important; } ");
// 去除右边栏
GM_addStyle(".GlobalSideBar { display: none !important; } ");
// 去除问题页右边栏
GM_addStyle(".Question-sideColumn { display: none !important; } ");
// 去除 topic 右边栏
GM_addStyle(".ContentLayout-sideColumn { display: none !important; } ");
// topic 加宽
GM_addStyle(".Topic-bar--borderBottom {width: 1000px;}");
// 搜索页加宽
GM_addStyle(".ListShortcut {width: 1000px; font-size: 20px}");
// 搜索页隐藏右边栏 SearchSideBar
GM_addStyle(".SearchSideBar {display: none;}");
// 个人页面隐藏右边栏
GM_addStyle(".Profile-sideColumn {display: none; }");
// 加宽
GM_addStyle(".Profile-mainColumn {width: 1000px; }");
GM_addStyle(".QuestionWaiting-mainColumn {width: 1000px; }");

GM_addStyle(".css-1mcaze2 {display: none; }");

// 隐藏推荐页中的广告
GM_addStyle(".TopstoryItem--advertCard {display: none; }");


// 创建元素
function createEle(eleName, text, attrs) {
  let ele = document.createElement(eleName);
  ele.innerText = text;
  for (let k in attrs) {
    ele.setAttribute(k, attrs[k]);
  }
  return ele;
}

// 防抖
function debounce(fn, wait) {
  let timeout = null;
  return function () {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(fn, wait);
  }
}


// 复制剪贴板
function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(function () {
    alert('succeed copy');
  }, function (err) {
    // clipboard write failed
    console.info('failed copy', err);
    alert('faild copy')
  });
}


// 站外链接直接跳转
function directLink() {
  let link, equal, colon, externalHref, protocol, path, newHref;
  // 文字链接
  link = document.querySelectorAll('a[class*="external"]')
  if (link) {
    link.forEach(function (_this) {
      if (_this.getElementsByTagName('span').length > 0) {
        newHref = _this.innerText;
        _this.setAttribute('href', newHref);
      } else if (_this.href.indexOf("link.zhihu.com/?target=") > -1) {
        externalHref = _this.href;
        newHref = externalHref.substring(externalHref = _this.href.indexOf("link.zhihu.com/?target=") + "link.zhihu.com/?target=".length);
        _this.setAttribute('href', decodeURIComponent(newHref));
      } else {
        externalHref = _this.href;
        if (externalHref.lastIndexOf("https%3A")) {
          newHref = _this.href.substring(_this.href.lastIndexOf("https%3A"));
        } else if (externalHref.lastIndexOf("http%3A%2F%2F")) {
          newHref = _this.href.substring(_this.href.lastIndexOf("http%3A"));
        }
        _this.setAttribute('href', decodeURIComponent(newHref));
      }
    });
  }
}

// 问题页（https://www.zhihu.com/question/xxxx）：转载、拉黑作者
function reprint() {
  const color = [
    {name: 'blue', value: '#0084ff'},
    {name: 'green', value: '#5cb85c'},
    {name: 'red', value: '#d9534f'},
    {name: 'green2', value: '#004E00'},
    {name: 'gray', value: 'gray'},
  ];
  const btnStyle = 'margin-top: 15px; margin-bottom: 15px; margin-left:-18px; cursor:pointer; color: #fff; border-radius: 3px; border: 1px solid; padding: 3px 6px';

  let num = 0;
  for (let item of document.querySelectorAll('div[class="List-item"]')) {
    const eleMeta = item.getElementsByClassName('ContentItem-meta')[0];
    const answerID = item.getElementsByTagName('div')[0].getAttribute('name');
    if (document.getElementById(answerID)) {
      continue;
    }

    const answerItem = item.getElementsByClassName('AnswerItem')[0];
    let dataZop = JSON.parse(answerItem.getAttribute("data-zop"));
    let userBlacklist = GM_getValue("menu_customBlockUsers").split("|");
    for (let user of userBlacklist) {
      console.log(user, dataZop.authorName);
      if (user === dataZop.authorName) {
        item.style = "display:none";
        break;
      }
    }

    const text = eleMeta.parentElement.getElementsByClassName("RichContent")[0].innerText;
    const reprintBtn = createEle('button',
      '一键转载',
      {
        id: answerID,
        style: `background:${color[num % color.length].value}; ${btnStyle}; margin-left:0`
      });
    // reprintBtn.setAttribute('value', text);
    reprintBtn.addEventListener('click', () => {
      updateClipboard(text)
    });
    eleMeta.append(reprintBtn);

    const blacklist = createEle('button',
      `拉黑 ${dataZop.authorName}`,
      {
        id: answerID,
        style: `background:${color[(num + 1) % color.length].value}; ${btnStyle}; margin-left:0`
      });
    blacklist.addEventListener('click', () => {
      let ok = confirm("拉黑该作者后，将屏蔽该作者在所有问题下的回答。【注：可通过自定义屏蔽用户将用户移除黑名单】");
      if (ok) {
        let users = GM_getValue("menu_customBlockUsers");
        GM_setValue("menu_customBlockUsers", users.concat("|", dataZop.authorName));
        item.style = "display:none";
      } else {
        console.log("取消拉黑");
      }
    });
    eleMeta.append(blacklist);
    num++;
  }
}

// feed item 的结构：顶层是 TopstoryItem，根据 item 类型不同分为：AnswerItem，ContentItem & ZVideoItem
function blockFeedItem() {
  let block = e => {
    if (e.target.innerHTML) {
      if (e.target.getElementsByClassName('AnswerItem').length > 0) {
        let item = e.target.getElementsByClassName('AnswerItem')[0]
        if (item) {
          let dataZop = item.getAttribute("data-zop")
          let parsed = JSON.parse(dataZop)
          let keywords = GM_getValue("menu_customBlockKeywords")
          if (keywords) {
            for (let keyword of keywords.split("|")) {
              if (parsed && parsed.title && parsed.title.includes(keyword)) {
                item.parentNode.remove()
                console.log("根据关键词", keyword, "已屏蔽回答", parsed.title)
                break
              }
            }
          }
          let users = GM_getValue("menu_customBlockUsers")
          if (users) {
            for (let user of users.split("|")) {
              if (parsed && parsed.authorName && parsed.authorName === user) {
                item.parentNode.remove()
                console.log("根据用户", user, "已屏蔽用户", parsed.authorName)
                break
              }
            }
          }
        }
        // else if https://www.zhihu.com/question/waiting 页屏蔽问题
      } else if (window.location.pathname === "/question/waiting" && e.target.getElementsByClassName('ContentItem').length > 0) {
        let item = e.target.getElementsByClassName('QuestionItem-title')[0]
        if (item) {
          let title = item.innerText
          if (title) {
            let keywords = GM_getValue("menu_customBlockQuestionKeywords")
            if (keywords) {
              for (let keyword of keywords.split("|")) {
                if (title.includes(keyword)) {
                  item.parentNode.parentNode.parentNode.remove()
                  console.log("根据关键词", keyword, "已屏蔽等你来答问题", title)
                  break
                }
              }
            }
          }
        }
      } else if (e.target.getElementsByClassName('ZVideoItem').length > 0) {
        let item = e.target.getElementsByClassName('ZVideoItem')[0];
        if (GM_getValue("menu_customBlockVideo")) {
          item.parentNode.remove();
          console.log("已屏蔽 1 条视频回答")
        }
      }
    }
  };
  document.addEventListener('DOMNodeInserted', block) // 监听插入事件
}

function registerMenuCommand(title, gmKey, promptInfo) {
  GM_registerMenuCommand(title, function () {
    let keywords = GM_getValue(gmKey);
    keywords = prompt(promptInfo, keywords);
    if (keywords) {
      GM_setValue(gmKey, keywords);
    }
  });
}

function registerMenuCommandByConfirm(title, gmKey, promptInfo) {
  GM_registerMenuCommand(title, function () {
    let current = confirm(promptInfo);
    GM_setValue(gmKey, current);
  });
}

registerMenuCommand("自定义屏蔽标题关键词", 'menu_customBlockKeywords', "编辑 [自定义屏蔽标题关键词]\n（不同关键字之间使用 \"|\" 分隔，例如：关键字A|关键字B|关键字C ）")
registerMenuCommand("自定义屏蔽用户", 'menu_customBlockUsers', "编辑 [自定义屏蔽用户]\n（不同关键字之间使用 \"|\" 分隔，例如：用户A|用户B|用户C ）");
registerMenuCommand("自定义屏蔽等你来答", 'menu_customBlockQuestionKeywords', "编辑 [自定义屏蔽问题]\n（不同关键字之间使用 \"|\" 分隔，例如：问题A|问题B|问题C ）");
registerMenuCommandByConfirm("是否要屏蔽视频", "menu_customBlockVideo", "点击 【取消】不会屏蔽视频，\n点击【确定】会屏蔽视频。");

(function () {
  'use strict';
  // Your code here...

  const urlZhiHuFeed = "https://www.zhihu.com/";
  const urlZhihuFollow = "https://www.zhihu.com/follow";
  const reUrlZhiHuQuestion = /https:\/\/www.zhihu.com\/question\/.*/;


  window.onload = (e) => {
    if (location.href === urlZhiHuFeed) {
      // 重定向首页到关注页面
      document.querySelector('a[href="/follow"]').click();
    }
    if (location.href === urlZhiHuFeed || urlZhihuFollow) {
      // 清除搜索框中的问题推荐
      document.querySelector("input#Popover1-toggle.Input").placeholder = "输入问题";
    }
  };

  window.addEventListener('scroll', debounce(() => {
    if (reUrlZhiHuQuestion.test(location.href)) {
      // 问题页增加转载按钮
      reprint();
    }
  }, 100));

  // 站外链接直接跳转
  setInterval(directLink, 100);

  // 屏蔽含关键字的问题, 屏蔽某用户答案
  blockFeedItem();

})();
