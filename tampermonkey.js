// ==UserScript==
// @name   知乎浏览助手
// @namespace    http://tampermonkey.net/
// @version      0.0.4
// @description 知乎浏览助手. 如果想报 bug, 可以通过知乎私信联系我, zhihu.com/people/kougazhang
// @author        kgzhang
// @match        https://www.zhihu.com/*
// @grant        GM_addStyle
// @grant        GM_log
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

// 隐藏活动图片
GM_addStyle(".css-1mcaze2 {display: none; }");


(function () {
  'use strict';
  // Your code here...

  const urlZhiHuFeed = "https://www.zhihu.com/";
  const reUrlZhiHuQuestion = /https:\/\/www.zhihu.com\/question\/.*/;
  const reUrlZhiHuFollow = /https:\/\/www.zhihu.com\/follow.*/;
  const color = [
    {name: 'blue', value: '#0084ff'},
    {name: 'green', value: '#5cb85c'},
    {name: 'red', value: '#d9534f'},
    {name: 'green2', value: '#004E00'},
    {name: 'gray', value: 'gray'},
  ];
  const btnStyle = 'margin-top: 15px; margin-bottom: 15px; margin-left:-18px; cursor:pointer; color: #fff; border-radius: 3px; border: 1px solid; padding: 3px 6px';

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

  // 防抖
  function debounce(fn, wait) {
    let timeout = null;
    return function () {
      if (timeout !== null) clearTimeout(timeout);
      timeout = setTimeout(fn, wait);
    }
  }

  // 创建元素
  function createEle(eleName, text, attrs) {
    let ele = document.createElement(eleName);
    ele.innerText = text;
    for (let k in attrs) {
      ele.setAttribute(k, attrs[k]);
    }
    return ele;
  }

  function block(item) {
    const move = (x) => {
      x.style.display = "none";
    };

    if (item === undefined) {
      return undefined;
    } else if (item instanceof window.NodeList) {
      item.forEach(i => block(i));
    } else {
      move(item);
    }
  }

  function addReprintBtn() {
    let num = 0;
    for (let item of document.querySelectorAll('div[class="List-item"]')) {
      const eleMeta = item.getElementsByClassName('ContentItem-meta')[0];
      const answerID = item.getElementsByTagName('div')[0].getAttribute('name');
      if (document.getElementById(answerID)) {
        continue;
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
      num++;
    }
  }

  window.onload = (e) => {
    if (location.href === urlZhiHuFeed) {
      // 重定向首页到关注页面
      document.querySelector('a[href="/follow"]').click();
    }
  };

  // follow 页去广告
  setInterval(() => {
    if (reUrlZhiHuFollow.test(location.href)) {
      block(document.querySelectorAll('div[class~="TopstoryItem--advertCard"]'));
    }
  }, 200);

  window.addEventListener('scroll', debounce(() => {
    // 问题页增加转载按钮
    if (reUrlZhiHuQuestion.test(location.href)) {
      addReprintBtn();
    }

  }, 100));

})();
