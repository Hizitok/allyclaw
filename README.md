# AllyClaw

An accessibility-focused fork of [OpenClaw](https://github.com/openclaw/openclaw) and [IronClaw](https://github.com/nearai/ironclaw) for visually impaired users.

AllyClaw adds screen reader compatibility, voice-guided setup, and text-to-speech output to both OpenClaw (TypeScript) and IronClaw (Rust) — letting you interact with your AI assistant without needing a screen.

[中文文档](README.zh.md)

## Choose Your Base

| | OpenClaw | IronClaw |
|---|---|---|
| **Language** | TypeScript | Rust |
| **TTS support** | ✅ Already built-in | 🚧 In development |
| **Installation** | `npm install -g openclaw` | Native binary |
| **Best for** | More features, active dev | Performance, auditability |

## What AllyClaw Adds

| Feature | OpenClaw | IronClaw |
|---------|----------|----------|
| Voice-guided setup (installer speaks every step) | ✅ | ✅ |
| TTS for agent responses | ✅ (built-in) | 🚧 (coming soon) |
| Screen reader compatibility | 🔮 Planned | 🔮 Planned |
| Keyboard-first navigation | 🔮 Planned | 🔮 Planned |
| High-contrast theme | 🔮 Planned | 🔮 Planned |

## Quick Start

**Requirements:** Node.js ≥ 18

```bash
git clone https://github.com/your-org/allyclaw.git
cd allyclaw
node setup.mjs
```

The setup script will:

1. Ask which project to install (OpenClaw or IronClaw)
2. Speak a welcome message using your system's built-in TTS
3. Ask your language preference for voice output
4. Install the selected project if not present
5. Configure TTS (for OpenClaw) or AI provider (for IronClaw)
6. Optionally run the onboarding wizard

All prompts are spoken aloud **and** printed to the terminal.

### Platform TTS used during setup

| Platform | Engine |
|----------|--------|
| Windows  | PowerShell `System.Speech.SpeechSynthesizer` (built-in) |
| macOS    | `say` command (built-in) |
| Linux    | `espeak-ng`, `espeak`, `spd-say`, or `festival` |

## Manual Installation

### OpenClaw (TypeScript)

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

### IronClaw (Rust)

```bash
# Windows
irm https://github.com/nearai/ironclaw/releases/latest/download/ironclaw-installer.ps1 | iex

# macOS / Linux
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/nearai/ironclaw/releases/latest/download/ironclaw-installer.sh | sh

# macOS with Homebrew
brew install ironclaw

# From source
cargo install ironclaw
```

## Configuration

### OpenClaw (`~/.openclaw/openclaw.json`)

```json
{
  "messages": {
    "tts": {
      "auto": "always",
      "mode": "final",
      "provider": "edge",
      "edge": {
        "enabled": true,
        "voice": "en-US-AriaNeural"
      }
    }
  }
}
```

### IronClaw (`~/.ironclaw/.env`)

```
LLM_BACKEND=nearai
```

## Upstream Projects

OpenClaw and IronClaw are included as git submodules:

```bash
git submodule update --init
```

## Contributing

Contributions especially welcome in:

- TTS integration for IronClaw (porting from OpenClaw)
- Screen reader and ARIA auditing
- Testing and feedback from visually impaired users
- Voice prompt translations

Please open an Issue before submitting a PR.

## Acknowledgements

- [OpenClaw](https://github.com/openclaw/openclaw) — TypeScript implementation (MIT)
- [IronClaw](https://github.com/nearai/ironclaw) — Rust implementation (MIT)

## License

MIT

## Buy Me A Coffee

    Bitcoin: bc1pjd7gc79yw7fqek9w6fwlkw28ad52vu8v90s4vy9d52g5pja2nn5sp56kqn
    ETH: 0xd799eba64aaf9cfd2169afc9685494a61d23012d
    Solana: C324pWC11MtAyp9wkRAqJqVFduymb6QjJC4bsF9wrdkz
