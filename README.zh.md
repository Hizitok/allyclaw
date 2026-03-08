# AllyClaw

[IronClaw](https://github.com/nearai/ironclaw) 的视障无障碍适配版本。

IronClaw 是 [OpenClaw](https://openclaw.ai/) 的 Rust 重写版——自托管 AI 助理，单一可执行文件，更易安全审查。AllyClaw 在此基础上添加语音输出、屏幕阅读器兼容和全程语音引导安装。

[English](README.md)

## IronClaw 是什么？

[IronClaw](https://github.com/nearai/ironclaw) 是一个 Rust 编写的开源个人 AI 助理，接入你已在使用的消息平台（Telegram、Discord、WhatsApp、Signal 等），完全运行在本地——无云依赖，数据不出设备。

与 TypeScript 参考实现（OpenClaw）相比，IronClaw 以单一原生二进制分发，启动更快、内存占用更低、安全审查更容易。

## AllyClaw 添加了什么

IronClaw 目前尚无对 AI 回复的语音输出功能。AllyClaw 的核心目标正是填补这一空白：

| 功能 | 状态 |
|------|------|
| **全程语音引导安装** — 安装脚本逐步朗读，无需鼠标 | ✅ 已完成 |
| **AI 回复 TTS 输出** — 所有回复通过 Edge TTS / OpenAI / ElevenLabs 朗读 | 🚧 开发中 |
| **屏幕阅读器兼容** — Web UI 适配 NVDA、JAWS、VoiceOver | 🔮 计划中 |
| **键盘全程可用** — 所有操作无需鼠标 | 🔮 计划中 |
| **高对比度主题** — 为低视力用户提供 | 🔮 计划中 |

## 快速开始

**环境要求：** Node.js ≥ 18（仅用于此安装脚本——IronClaw 本身是原生二进制，无需 Node）

```bash
git clone https://github.com/your-org/allyclaw.git
cd allyclaw
node setup.mjs
```

安装脚本会：

1. 使用系统内置 TTS 朗读欢迎语——无需任何配置
2. 询问你偏好的语音语言
3. 若未安装 IronClaw，自动安装
4. 询问使用哪个 AI 服务商（默认 NEAR AI：免费，浏览器一次性登录，无需 API key）
5. 将配置写入 `~/.ironclaw/.env`
6. 可选：运行 `ironclaw onboard` 配置消息平台
7. 可选：启动 IronClaw 后台服务

所有提示**同时朗读并打印到终端**，盲文点显器用户也可同步获取。

### 安装脚本使用的系统 TTS

| 平台 | 引擎 |
|------|------|
| Windows | PowerShell `System.Speech.SpeechSynthesizer`（系统内置） |
| macOS | `say` 命令（系统内置） |
| Linux | 依次尝试 `espeak-ng`、`espeak`、`spd-say`、`festival` |

## 手动安装 IronClaw

如需在运行脚本前自行安装 IronClaw：

```bash
# Windows（PowerShell）
irm https://github.com/nearai/ironclaw/releases/latest/download/ironclaw-installer.ps1 | iex

# macOS / Linux
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/nearai/ironclaw/releases/latest/download/ironclaw-installer.sh | sh

# macOS（Homebrew）
brew install ironclaw

# 从源码编译（需要 Rust）
cargo install ironclaw
```

## 上游仓库

IronClaw 以 git submodule 形式引入：

```bash
git submodule update --init
```

## 参与贡献

特别欢迎以下方向的贡献：

- TTS 输出集成（IronClaw 核心缺失功能）
- 视障用户参与测试并提供反馈
- IronClaw Web UI 屏幕阅读器与 ARIA 审查
- 安装脚本语音提示的多语言翻译

提交 PR 前请先创建 Issue 描述你的想法。

## 致谢

- [IronClaw](https://github.com/nearai/ironclaw) — 上游项目（MIT 许可证）
- [OpenClaw](https://openclaw.ai/) — TypeScript 参考实现

## 许可证

MIT


## Buy Me A Coffee

    Bitcoin: bc1pjd7gc79yw7fqek9w6fwlkw28ad52vu8v90s4vy9d52g5pja2nn5sp56kqn
    ETH: 0xd799eba64aaf9cfd2169afc9685494a61d23012d
    Solana: C324pWC11MtAyp9wkRAqJqVFduymb6QjJC4bsF9wrdkz
