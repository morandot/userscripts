// ==UserScript==
// @name         CG 平台解除复制粘贴限制
// @name:EN      Unlock Copy Paste on CG Platform
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  解除 CG 平台网页禁止复制、粘贴、选择文字、右键菜单的限制
// @author       Moran Fong
// @homepageURL  https://github.com/morandot/userscripts
// @supportURL   https://github.com/morandot/userscripts/issues
// @downloadURL  https://raw.githubusercontent.com/morandot/userscripts/main/src/unlock-copy-paste-on-cg.js
// @updateURL    https://raw.githubusercontent.com/morandot/userscripts/main/src/unlock-copy-paste-on-cg.js
// @match        *://dsjoj.masu.edu.cn/*
// @match        *://10.6.6.99/*
// @license      MIT
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    function isInsideEditor(e) {
        var el = e.target;
        while (el) {
            if (el.classList && (
                el.classList.contains('CodeMirror') ||
                el.classList.contains('ace_editor') ||
                el.contentEditable === 'true' ||
                el.tagName === 'TEXTAREA' ||
                el.tagName === 'INPUT'
            )) {
                return true;
            }
            el = el.parentElement;
        }
        return false;
    }

    var nonKeyEvents = [
        'copy', 'cut', 'paste',
        'contextmenu',
        'selectstart', 'select',
        'dragstart', 'beforecopy', 'beforecut', 'beforepaste'
    ];

    nonKeyEvents.forEach(function (evt) {
        document.addEventListener(evt, function (e) {
            e.stopPropagation();
        }, true);
    });

    ['keydown', 'keyup'].forEach(function (evt) {
        document.addEventListener(evt, function (e) {
            if (!isInsideEditor(e)) {
                e.stopPropagation();
            }
        }, true);
    });

    window.addEventListener('DOMContentLoaded', function () {
        var allElements = document.querySelectorAll('*');
        var attrEvents = [
            'oncopy', 'oncut', 'onpaste',
            'oncontextmenu', 'onselectstart', 'onselect',
            'ondragstart', 'onbeforecopy', 'onbeforecut', 'onbeforepaste',
            'onkeydown', 'onkeyup'
        ];
        allElements.forEach(function (el) {
            attrEvents.forEach(function (attr) {
                if (el.hasAttribute(attr)) {
                    el.removeAttribute(attr);
                }
            });
        });
        if (document.body) {
            attrEvents.forEach(function (attr) {
                document.body.removeAttribute(attr);
            });
        }
    });

    var style = document.createElement('style');
    style.textContent = '* { user-select: auto !important; -webkit-user-select: auto !important; }';

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
