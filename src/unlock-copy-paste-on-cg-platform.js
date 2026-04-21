// ==UserScript==
// @name         CG 平台解除复制粘贴限制
// @name:EN      Unlock Copy Paste on CG Platform
// @name:zh-CN   CG 平台解除复制粘贴限制
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  解除 CG 平台网页禁止复制、粘贴、选择文字、右键菜单的限制
// @author       Moran
// @homepageURL  https://github.com/morandot/userscripts
// @supportURL   https://github.com/morandot/userscripts/issues
// @downloadURL  https://raw.githubusercontent.com/morandot/userscripts/main/src/unlock-copy-paste-on-cg-platform.js
// @updateURL    https://raw.githubusercontent.com/morandot/userscripts/main/src/unlock-copy-paste-on-cg-platform.js
// @match        *://dsjoj.masu.edu.cn/*
// @match        *://10.6.6.99/*
// @license      MIT
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    var attrEvents = [
        'oncopy', 'oncut', 'onpaste',
        'oncontextmenu', 'onselectstart', 'onselect',
        'ondragstart', 'onbeforecopy', 'onbeforecut', 'onbeforepaste', 'onbeforeinput',
        'onkeydown', 'onkeyup'
    ];
    var inlineHandlerSelector = attrEvents.map(function (attr) {
        return '[' + attr + ']';
    }).join(',');

    function isClipboardShortcut(e) {
        var key = typeof e.key === 'string' ? e.key.toLowerCase() : '';

        if ((e.ctrlKey || e.metaKey) && (key === 'a' || key === 'c' || key === 'v' || key === 'x')) {
            return true;
        }

        return e.shiftKey && key === 'insert';
    }

    function shouldBypassRestriction(evt, e) {
        if (evt !== 'beforeinput') {
            return true;
        }

        return e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop';
    }

    function removeInlineRestrictions(root) {
        var elements = [];

        if (root === document) {
            elements = Array.prototype.slice.call(document.querySelectorAll(inlineHandlerSelector));
        } else if (root && root.nodeType === Node.ELEMENT_NODE) {
            if (root.matches(inlineHandlerSelector)) {
                elements.push(root);
            }
            elements = elements.concat(Array.prototype.slice.call(root.querySelectorAll(inlineHandlerSelector)));
        }

        elements.forEach(function (el) {
            attrEvents.forEach(function (attr) {
                if (el.hasAttribute(attr)) {
                    el.removeAttribute(attr);
                }
            });
        });
    }

    var restrictedEvents = [
        'copy', 'cut', 'paste',
        'contextmenu',
        'selectstart', 'select',
        'dragstart', 'beforecopy', 'beforecut', 'beforepaste', 'beforeinput'
    ];

    restrictedEvents.forEach(function (evt) {
        document.addEventListener(evt, function (e) {
            if (!shouldBypassRestriction(evt, e)) {
                return;
            }

            e.stopImmediatePropagation();
        }, true);
    });

    ['keydown', 'keyup'].forEach(function (evt) {
        document.addEventListener(evt, function (e) {
            if (isClipboardShortcut(e)) {
                e.stopImmediatePropagation();
            }
        }, true);
    });

    window.addEventListener('DOMContentLoaded', function () {
        removeInlineRestrictions(document);
    });

    var cleanupObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    removeInlineRestrictions(node);
                }
            });
        });
    });

    function startCleanupObserver() {
        if (!document.documentElement) {
            return;
        }

        cleanupObserver.observe(document.documentElement, { childList: true, subtree: true });
    }

    if (document.documentElement) {
        startCleanupObserver();
    } else {
        window.addEventListener('DOMContentLoaded', startCleanupObserver, { once: true });
    }

    var style = document.createElement('style');
    style.textContent = [
        'body, article, section, main, aside, p, span, div, li, td, th,',
        'blockquote, pre, code, label, a, h1, h2, h3, h4, h5, h6,',
        'input, textarea, [contenteditable="true"] {',
        '  user-select: text !important;',
        '  -webkit-user-select: text !important;',
        '}'
    ].join('\n');

    if (document.head) {
        document.head.appendChild(style);
    } else {
        var observer = new MutationObserver(function () {
            if (document.head) {
                document.head.appendChild(style);
                observer.disconnect();
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }
})();
