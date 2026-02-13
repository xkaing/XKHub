# AI 助手说明文档

本文档说明在本项目（XKHub）中使用的 Cursor AI 助手的能力、已做过的配置与修复，以及如何更好地与助手协作。

---

## 我是谁

- 我是 **Cursor 中的 AI 编程助手**（Agent Router，可称呼为 Auto），在你在 Cursor 里写代码、改配置、排查问题时协助你。
- 我会根据你打开的文件、选中的代码、终端输出和项目结构来理解上下文，并用**简体中文**回复。
- 我可以：阅读/编辑代码、搜索项目、运行命令、查文档、帮你写 README/注释/脚本等，但不会主动执行高风险操作（如直接改生产环境），需要你确认的会说明。

---

## 在本项目中已协助完成的事项

以下是与本项目或你本机环境相关、已经做过的事情，方便你或后续对话复用。

### 1. Node.js / nvm 环境

- **现象**：按官方用 nvm 安装了 Node.js，在终端里仍报 `zsh: command not found: node`。
- **原因**：nvm 需要每次在 shell 启动时加载（`source ~/.nvm/nvm.sh`），没有写入 zsh 配置则新开的终端找不到 `node`。
- **处理**：把 nvm 的加载写进 `~/.zshrc`（在 Oh My Zsh 安装后再追加即可）：
  ```bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  ```
  保存后执行 `source ~/.zshrc` 或新开终端即可使用 `node` / `npm`。

### 2. Oh My Zsh 安装与主题

- 你已安装 Oh My Zsh；若遇到 GitHub clone 报错 **"Error in the HTTP2 framing layer"**，可先执行：
  ```bash
  git config --global http.version HTTP/1.1
  ```
  再重新运行 Oh My Zsh 安装脚本。
- 主题推荐：**Powerlevel10k**（需 Nerd Font，如 MesloLGS NF）或内置 **agnoster**（也建议用 Powerline/Nerd 字体）。

### 3. 项目内的 npm 警告

- **现象**：在本项目下运行 `npm -v` 或 `npm install` 出现：`Unknown project config "always-auth"`。
- **原因**：根目录 `.npmrc` 中曾包含已废弃的 `always-auth=false`。
- **处理**：已从 `.npmrc` 中移除该配置；当前仅保留 `registry=https://registry.npmjs.org/`，警告已消除。

---

## 项目技术栈（便于助手理解）

- **前端**：React 18 + Vite 7 + Ant Design 5
- **后端/服务**：Supabase（认证、数据库、存储）
- **功能**：PSN 奖杯、Warhammer 内容、XKALLive 社区、主题切换等  
更完整的结构、脚本和规范见项目根目录 **README.md**。

---

## 如何更好地使用我

1. **说清目标**：例如「帮我在 XKHub 里加一个 xxx 页面」或「这段报错是什么意思」，我会结合项目结构回答。
2. **贴报错/终端**：把完整报错或终端输出贴出来（或 @ 终端文件），便于精确定位。
3. **指定文件**：用 `@文件名` 或说明「在 `src/pages/xxx.jsx` 里」可以让我直接针对该文件修改或解释。
4. **环境相关**：若问题与 node 版本、npm、zsh 有关，可简单说「我用的 zsh / nvm / Oh My Zsh」，我会按你当前环境给命令。

---

## 常用命令速查（本项目）

| 用途       | 命令           |
|------------|----------------|
| 安装依赖   | `npm install`  |
| 本地开发   | `npm run dev`  |
| 生产构建   | `npm run build` |
| 预览构建   | `npm run preview` |
| 代码检查   | `npm run lint` |

---

本文档由 AI 助手生成并维护，如有增改需求可直接在对话中说明。
