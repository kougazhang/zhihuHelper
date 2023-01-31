// ==UserScript==
// @name   知乎浏览助手
// @namespace    http://tampermonkey.net/
// @version      0.0.8
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

(function () {
  'use strict';

    /****************** Global ****************************************/
    // Be largger the font;
    GM_addStyle("body {font-size: 25px}");
    // Hidden Topstory-hot
    GM_addStyle('a[aria-controls="Topstory-hot"] { display: none !important; }');
    // Hidden Topstory-zvideo
    GM_addStyle('a[aria-controls="Topstory-zvideo"] { display: none !important; }');
    // Hidden Topstory-recommend
    GM_addStyle('a[aria-controls="Topstory-recommend"] { display: none !important; }');
    // Display 首页 only
    GM_addStyle('ul[class~="AppHeader-Tabs"] :not(:first-child) { display: none !important; }')
    // Hidden placeholder of search bar
    GM_addStyle('::placeholder {color: transparent !important;}');
    /****************** Global ****************************************/


    /***************** Follow page***********************/
    // Remove RightSideBar
    GM_addStyle("div[data-za-detail-view-path-module='RightSideBar']  { display: none !important; } ");
    // Remove AD
    GM_addStyle(".TopstoryItem--advertCard {display: none; }");
    // Widen mainColumn
    GM_addStyle(".Topstory-container { width: 1500px !important; } ");
    GM_addStyle(".Topstory-mainColumn { width: 1500px !important; } ");
    // Be lagger the font of question title
    GM_addStyle('.ContentItem-title {font-size: x-large}');
    /***************** Follow page***********************/

    /****************** Question page *********************************/
    // Widen mainColumn
    GM_addStyle(".Question-main { width: 1500px !important; } ");
    GM_addStyle(".Question-mainColumn { width: 1500px !important; } ");
    // display & Make time at top
    GM_addStyle('meta[itemprop="dateModified"] {display: block; height: 20px; padding: 10px}');
    GM_addStyle('meta[itemprop="dateModified"]::after {content: "DateModified: " attr(content); color:#8590a6;}');
    /****************** Question page *********************************/

    /****************** Search page ***********************************************/
    // Hidden right bar
    GM_addStyle(".css-knqde {display: none !important;}");
    // Widen main bar
    GM_addStyle(".Search-container { width: 1500px !important; } ");
    GM_addStyle(".SearchMain { width: 1500px !important; } ");
    /****************** Search page ***********************************************/

    /****************** Topic page ***********************************************/
    // Widen main bar
    GM_addStyle('div[data-za-detail-view-path-module="TopicItem"] { max-width: 1500px !important; } ');
    /****************** Topic page ***********************************************/

    /******************* Free copy**********************************************/
    var body = document.getElementsByTagName('body')[0];
    body.addEventListener('copy', function (e) {
        e.stopPropagation();
    }, false);
    /******************* Free copy**********************************************/
})()
