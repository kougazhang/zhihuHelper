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

  const getColor = (name) => {
    for (let c of color) {
      if (c.name === name) {
        return c.value;
      }
    }
  };

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

  class ElementEventSwitch {

    constructor(conf) {
      this.true = '1';
      this.false = '0';
      this.$all = {
        do: {
          status: this.true,
          color: conf.do.color,
          confirmInfo: conf.do.confirmInfo,
          eleText: conf.do.eleText,
          action: () => {
            if (confirm(this.$all.do.confirmInfo)) {
              this.mountEvent();
              this.setLocalStatus(this.$all.do.status);
              this.changeColor(this.$all.do.color);
              this.changeInnerText(this.$all.do.eleText);
            }
          }
        },
        undo: {
          status: this.false,
          color: conf.undo.color,
          eleText: conf.undo.eleText,
          confirmInfo: conf.undo.confirmInfo,
          action: () => {
            if (confirm(this.$all.undo.confirmInfo)) {
              this.unmountEvent();
              this.setLocalStatus(this.$all.undo.status);
              this.changeColor(this.$all.undo.color);
              this.changeInnerText(this.$all.undo.eleText);
            }
          }
        }
      };
      this.eleID = conf.eleID;
      this.eleType = conf.eleType;
      this.eleStyle = conf.eleStyle;
      this.text = conf.eleText;
      this.eventType = conf.eventType;
      this.eventAction = conf.eventAction;
    }

    create() {
      // 根据 localStatus 进行初始化动作
      let color = this.$all.do.color;
      let text = this.$all.do.eleText;
      if (this.localStatusIsTrue()) {
        this.mountEvent();
      } else {
        color = this.$all.undo.color;
        text = this.$all.undo.eleText;
      }
      // 创建元素
      const ele = createEle(this.eleType,
        text,
        {
          id: this.eleID,
          style: `background: ${color}; ${this.eleStyle}`
        });
      ele.addEventListener('click', (e) => {
        !this.localStatusIsTrue() ? this.$all.do.action() : this.$all.undo.action();
      });
      return ele;
    }

    localStatusIsTrue() {
      return localStorage.getItem(this.eleID) === this.$all.do.status
    }

    setLocalStatus(status) {
      localStorage.setItem(this.eleID, status);
    }

    mountEvent() {
      window.addEventListener(this.eventType, this.eventAction);
    }

    unmountEvent() {
      window.removeEventListener(this.eventType, this.eventAction);
    }

    changeColor(color) {
      document.getElementById(this.eleID).style.backgroundColor = color;
    }

    changeInnerText(text) {
      document.getElementById(this.eleID).innerText = text;
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

  // 屏蔽非问题推荐
  function displayQuestionOnly() {
    // 只在 feed 页生效
    if (location.href !== urlZhiHuFeed) {
      return;
    }
    for (let item of document.getElementsByClassName('TopstoryItem-isRecommend')) {
      const title = item.getElementsByTagName('a')[0].innerText;
      if (!title.endsWith("？")) {
        block(item);
      } else {
      }
    }
  }

  // 屏蔽热榜
  function blockTopStoryHot() {
    block(document.querySelectorAll('a[href="/hot"]'));
  }

  function blockActivity() {
    block(document.querySelector('a[class="css-w3ttmg"]'));
  }

  // 过滤推荐
  function addBtnDisplayQuestion() {
    const conf = {
      do: {
        confirmInfo: '确认开启过滤推荐?',
        color: getColor('blue'),
        eleText: '过滤:)',
      },
      undo: {
        color: getColor('gray'),
        confirmInfo: '确认关闭过滤推荐?',
        eleText: '过滤:('
      },
      eleStyle: btnStyle,
      eleID: 'btnElementEventSwitch',
      eleType: 'a',
      eventType: 'scroll',
      eventAction: debounce(displayQuestionOnly, 100),
    };
    const btnQuestion = new ElementEventSwitch(conf);
    // 显示在热榜节点的后面
    const eleRecommend = document.querySelectorAll('a[href="/"]')[1];
    eleRecommend.parentElement.insertBefore(btnQuestion.create(), eleRecommend.nextSibling);
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


  function importantFollow() {
    let num = 0;
    const parseEleUrl = (eleUrl) => {
      if (!eleUrl) {
        return undefined;
      }
      const url = eleUrl.getAttribute('content');
      return {
        url: url,
        key: url ? url.split('/').pop() : '',
      }
    };
    for (let item of document.querySelectorAll('div[class~="TopstoryItem"]')) {
      const eleUrls = item.querySelectorAll('meta[itemprop="url"]');
      if (!eleUrls) {
        continue;
      }
      const author = parseEleUrl(eleUrls[0]);
      const question = parseEleUrl(eleUrls[1]);
      const answer = parseEleUrl(eleUrls[2]);
      if (!(author && question && answer)) {
        continue;
      }
      const cacheKey = `${author.key},${question.key},${answer.key}`;
      if (sessionStorage.getItem(cacheKey)) {
        continue;
      }
      const eleMeta = item.querySelector('div[class="FeedSource"]');
      const reprintBtn = createEle('button',
        '重点关注',
        {style: `background:${color[num % color.length].value}; ${btnStyle}; margin-left:0`});
      // // reprintBtn.setAttribute('value', text);
      // reprintBtn.addEventListener('click', () => {
      //     updateClipboard(text)
      // });
      eleMeta.append(reprintBtn);
      sessionStorage.setItem(cacheKey, '1');
      num++;
    }
  }

  window.onload = (e) => {

    // 屏蔽热榜和屏蔽活动栏
    if (location.href === urlZhiHuFeed || reUrlZhiHuFollow.test(location.href)) {
      // 屏蔽热榜
      blockTopStoryHot();
      // 屏蔽活动栏
      blockActivity();
      // 屏蔽顶部栏的发现按钮
      block(document.querySelector('a[href="//www.zhihu.com/explore"]').parentElement);
      // 屏蔽顶部栏等你来答
      block(document.querySelector('a[href="//www.zhihu.com/question/waiting"]').parentElement)
      // 屏蔽搜索框 placeholder
      document.getElementsByTagName('input')[0].placeholder = '';
    }

    // 对知乎首页的优化
    if (location.href === urlZhiHuFeed) {
      // 过滤推荐
      addBtnDisplayQuestion();
      // 跳转到关注页面
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
    // follow 页添加重点关注按钮
    if (reUrlZhiHuFollow.test(location.href)) {
      importantFollow();
      // 问题页增加转载按钮
    } else if (reUrlZhiHuQuestion.test(location.href)) {
      addReprintBtn();
    }

  }, 100));

})();
