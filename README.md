# UserScripts

一个存放 Tampermonkey/Greasemonkey 用户脚本的仓库。当前脚本主要覆盖中文内容排版、微博使用增强，以及特定站点的复制粘贴限制解除。

## Scripts

| Script | Purpose | Sites | Install | Source |
| --- | --- | --- | --- | --- |
| Text Auto Space | 为现代浏览器补充 `text-autospace` CSS 特性，改善中西文混排显示 | All sites | [GreasyFork](https://greasyfork.org/zh-CN/scripts/553348-text-auto-space) / [GitHub Raw](https://raw.githubusercontent.com/morandot/userscripts/main/src/text-autospace.js) | [Source](https://github.com/morandot/userscripts/blob/main/src/text-autospace.js) |
| 微博一键拉黑 | 在微博用户名旁显示一键拉黑按钮 | `weibo.com` | [GreasyFork](https://greasyfork.org/zh-CN/scripts/553542-%E5%BE%AE%E5%8D%9A%E4%B8%80%E9%94%AE%E6%8B%89%E9%BB%91) / [GitHub Raw](https://raw.githubusercontent.com/morandot/userscripts/main/src/weibo-one-click-block.js) | [Source](https://github.com/morandot/userscripts/blob/main/src/weibo-one-click-block.js) |
| CG 平台解除复制粘贴限制 | 解除指定 CG 平台网页的复制、粘贴、选中和右键限制 | `dsjoj.masu.edu.cn`, `10.6.6.99` | [GitHub Raw](https://raw.githubusercontent.com/morandot/userscripts/main/src/unlock-copy-paste-on-cg.js) | [Source](https://github.com/morandot/userscripts/blob/main/src/unlock-copy-paste-on-cg.js) |

## Installation

推荐使用 Tampermonkey。

1. 打开上表中的 `GreasyFork` 或 `GitHub Raw` 安装链接。
2. 在脚本管理器中确认安装。
3. 刷新目标网页后生效。

## Development

- 源码目录：[`src/`](https://github.com/morandot/userscripts/tree/main/src)
- 问题反馈：[`Issues`](https://github.com/morandot/userscripts/issues)
- 许可证：[`MIT`](./LICENSE)

如果脚本从 GitHub Raw 安装，更新依赖脚本头部的 `@downloadURL` / `@updateURL` 元数据。
