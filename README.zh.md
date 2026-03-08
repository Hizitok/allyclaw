# AllyClaw

[OpenClaw](https://github.com/openclaw/openclaw) 和 [IronClaw](https://github.com/nearai/ironclaw) 的视障无障碍适配版本。

AllyClaw 为 OpenClaw（TypeScript）和 IronClaw（Rust）两者添加屏幕阅读器兼容、语音引导安装和文字转语音输出，让你无需屏幕即可与 AI 助理交互。

[English](README.md)

## 选择你的版本

| | OpenClaw | IronClaw |
|---|---|---|
| **语言** | TypeScript | Rust |
| **TTS 支持** | ✅ 已内置 | 🚧 开发中 |
| **安装方式** | `npm install -g openclaw` | 原生二进制 |
| **适合** | 更多功能、活跃开发 | 性能优先、易审查 |

## AllyClaw 添加的功能

| 功能 | OpenClaw | IronClaw |
|------|----------|----------|
| 语音引导安装（每步朗读） | ✅ | ✅ |
| AI 回复 TTS 输出 | ✅（内置） | 🚧（即将支持） |
| 屏幕阅读器兼容 | 🔮 计划中 | 🔮 计划中 |
| 键盘全程可用 | 🔮 计划中 | 🔮 计划中 |
| 高对比度主题 | 🔮 计划中 | 🔮 计划中 |

## 快速开始

**环境要求：** Node.js ≥ 18

```bash
git clone https://github.com/your-org/allyclaw.git
cd allyclaw
node setup.mjs
```

安装脚本会：

1. 询问选择安装哪个项目（OpenClaw 或 IronClaw）
2. 使用系统内置 TTS 朗读欢迎语
3. 询问偏好的语音语言
4. 若未安装，自动安装所选项目
5. 配置 TTS（OpenClaw）或 AI 服务商（IronClaw）
6. 可选运行 onboarding 向导

所有提示**同时朗读并打印到终端**。

### 安装脚本使用的系统 TTS

| 平台 | 引擎 |
|------|------|
| Windows | PowerShell `System.Speech.SpeechSynthesizer`（内置） |
| macOS | `say` 命令（内置） |
| Linux | `espeak-ng`、`espeak`、`spd-say` 或 `festival` |

## 手动安装

### OpenClaw（TypeScript）

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

### IronClaw（Rust）

```bash
# Windows
irm https://github.com/nearai/ironclaw/releases/latest/download/ironclaw-installer.ps1 | iex

# macOS / Linux
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/nearai/ironclaw/releases/latest/download/ironclaw-installer.sh | sh

# macOS (Homebrew)
brew install ironclaw

# 从源码编译
cargo install ironclaw
```

## 配置

### OpenClaw（`~/.openclaw/openclaw.json`）

```json
{
  "messages": {
    "tts": {
      "auto": "always",
      "mode": "final",
      "provider": "edge",
      "edge": {
        "enabled": true,
        "voice": "zh-CN-XiaoxiaoNeural"
      }
    }
  }
}
```

### IronClaw（`~/.ironclaw/.env`）

```
LLM_BACKEND=nearai
```

## 上游项目

OpenClaw 和 IronClaw 以 git submodule 形式引入：

```bash
git submodule update --init
```

## 参与贡献

特别欢迎以下方向的贡献：

- 为 IronClaw 集成 TTS（从 OpenClaw 移植）
- 屏幕阅读器与 ARIA 审查
- 视障用户测试与反馈
- 语音提示翻译

提交 PR 前请先创建 Issue。

## 致谢

- [OpenClaw](https://github.com/openclaw/openclaw) — TypeScript 实现（MIT）
- [IronClaw](https://github.com/nearai/ironclaw) — Rust 实现（MIT）

## 许可证

MIT
