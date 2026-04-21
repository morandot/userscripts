// ==UserScript==
// @name         微博一键拉黑
// @name:EN      Weibo Quick Block User
// @name:zh-CN   微博一键拉黑
// @namespace    http://tampermonkey.net/
// @version      1.0.5
// @description  一键拉黑微博用户。在博主、转发者和评论者的用户名旁显示拉黑按钮。
// @author       Moran
// @homepageURL  https://github.com/morandot/userscripts
// @supportURL   https://github.com/morandot/userscripts/issues
// @downloadURL  https://raw.githubusercontent.com/morandot/userscripts/main/src/weibo-quick-block-user.js
// @updateURL    https://raw.githubusercontent.com/morandot/userscripts/main/src/weibo-quick-block-user.js
// @match        https://weibo.com/*
// @grant        GM_addStyle
// @license      MIT
// @icon         https://weibo.com/favicon.ico
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle(`
      .weibo-block-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-left: 6px;
        padding: 1px 6px;
        font-size: 12px;
        border-radius: 6px;
        background-color: rgba(255, 77, 79, 0.15);
        color: #ff4d4f;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        vertical-align: middle;
      }
      .weibo-block-btn:hover {
        background-color: rgba(255, 77, 79, 0.25);
      }
      .weibo-block-btn.blocked {
        background-color: rgba(82, 196, 26, 0.15);
        color: #52c41a;
        cursor: default;
      }
      .weibo-block-btn.loading {
        opacity: 0.6;
        cursor: wait;
      }
      .weibo-block-btn:disabled {
        pointer-events: none;
      }
      @media (prefers-color-scheme: dark) {
        .weibo-block-btn {
          background-color: rgba(255, 99, 99, 0.2);
          color: #ff7875;
        }
        .weibo-block-btn:hover {
          background-color: rgba(255, 99, 99, 0.35);
        }
      }
    `);

    const BLOCK_URL = "https://weibo.com/ajax/statuses/filterUser";
    const NAME_SELECTOR = 'a[href*="/u/"]:not([data-block-added])';
    let myUid = "";
    let injectScheduled = false;
    const pendingRoots = new Set();

    function extractUid(value) {
      if (value == null) {
        return "";
      }

      const normalized = String(value);
      const uidFromUrl = normalized.match(/\/u\/(\d+)/);
      if (uidFromUrl) {
        return uidFromUrl[1];
      }

      const uidFromDigits = normalized.match(/^\d+$/);
      return uidFromDigits ? uidFromDigits[0] : "";
    }

    function getMyUid() {
      const candidates = [
        window.$CONFIG && window.$CONFIG.uid,
        window.$CONFIG && window.$CONFIG.user && window.$CONFIG.user.uid,
        window.__INITIAL_STATE__ && window.__INITIAL_STATE__.config && window.__INITIAL_STATE__.config.uid,
        window.__INITIAL_STATE__ && window.__INITIAL_STATE__.loginUserInfo && window.__INITIAL_STATE__.loginUserInfo.uid,
        document.body && document.body.dataset && document.body.dataset.uid,
        document.documentElement && document.documentElement.dataset && document.documentElement.dataset.uid,
      ];

      for (const candidate of candidates) {
        const uid = extractUid(candidate);
        if (uid) {
          myUid = uid;
          return myUid;
        }
      }

      return myUid;
    }

    try {
        getMyUid();
    } catch (e) {
        console.error("[weibo-block] Error getting myUid:", e);
    }

    function getXsrfToken() {
      return document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || "";
    }

    function setButtonState(btn, text, state) {
      btn.textContent = text;
      btn.classList.toggle("loading", state === "loading");
      btn.classList.toggle("blocked", state === "blocked");
      btn.disabled = state === "loading" || state === "blocked";

      if (state === "error") {
        btn.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
      } else {
        btn.style.removeProperty("background-color");
      }
    }

    async function blockUser(uid, btn) {
      setButtonState(btn, "处理中...", "loading");
      try {
        const res = await fetch(BLOCK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-xsrf-token": getXsrfToken(),
            "x-requested-with": "XMLHttpRequest",
          },
          body: JSON.stringify({
            uid: uid,
            status: 1,
            interact: 1,
            follow: 1,
          }),
        });

        if (!res.ok) {
          throw new Error("Unexpected HTTP status " + res.status);
        }

        const data = await res.json();
        if (data.ok === 1 && (data.result === "true" || data.result === true)) {
          setButtonState(btn, "已拉黑", "blocked");
        } else {
          setButtonState(btn, "失败", "error");
        }
      } catch (err) {
        console.error("[weibo-block] Request failed:", err);
        setButtonState(btn, "出错", "error");
      }
    }

    function collectNameNodes(root) {
      const nodes = [];

      if (!root) {
        return nodes;
      }

      if (root === document) {
        return Array.from(document.querySelectorAll(NAME_SELECTOR));
      }

      if (root.nodeType !== Node.ELEMENT_NODE) {
        return nodes;
      }

      if (root.matches(NAME_SELECTOR)) {
        nodes.push(root);
      }

      return nodes.concat(Array.from(root.querySelectorAll(NAME_SELECTOR)));
    }

    function injectButtons(root) {
      const nameNodes = collectNameNodes(root);
      const currentMyUid = getMyUid();

      nameNodes.forEach(a => {
        if (a.innerText.trim() === '' && a.querySelector('img')) {
          a.setAttribute("data-block-added", "true");
          return;
        }

        const uidMatch = a.href.match(/\/u\/(\d+)/);
        if (!uidMatch) {
          return;
        }
        const uid = uidMatch[1];

        if (currentMyUid && uid === currentMyUid) {
          a.setAttribute("data-block-added", "true");
          return;
        }

        if (a.nextElementSibling && a.nextElementSibling.classList.contains("weibo-block-btn")) {
          a.setAttribute("data-block-added", "true");
          return;
        }

        const inCommentText = a.closest('div[data-comment-id] span[class*="cmt_text"]');
        if (inCommentText) {
          a.setAttribute("data-block-added", "true");
          return;
        }

        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "拉黑";
        btn.className = "weibo-block-btn";
        btn.setAttribute("aria-label", "拉黑用户 " + a.innerText.trim());
        btn.addEventListener("click", e => {
          e.preventDefault();
          e.stopPropagation();
          if (!btn.disabled) {
            blockUser(uid, btn);
          }
        });

        a.setAttribute("data-block-added", "true");
        a.insertAdjacentElement("afterend", btn);
      });
    }

    function scheduleInject(root) {
      pendingRoots.add(root || document);

      if (injectScheduled) {
        return;
      }

      injectScheduled = true;
      requestAnimationFrame(() => {
        const roots = Array.from(pendingRoots);
        pendingRoots.clear();
        injectScheduled = false;

        roots.forEach(injectButtons);
      });
    }

    function startObserver() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              scheduleInject(node);
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.body) {
      startObserver();
    } else {
      window.addEventListener("DOMContentLoaded", startObserver, { once: true });
    }

    scheduleInject(document);

  })();
  
