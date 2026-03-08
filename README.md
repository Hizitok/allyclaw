# AllyClaw

An accessibility-focused adaptation of [IronClaw](https://github.com/nearai/ironclaw) for visually impaired users.

IronClaw is a Rust-based, self-hosted AI assistant — a re-implementation of [OpenClaw](https://openclaw.ai/) with better auditability and memory safety. AllyClaw extends it with voice output, screen reader compatibility, and a fully voice-guided setup.

[中文文档](README.zh.md)

## What Is IronClaw?

[IronClaw](https://github.com/nearai/ironclaw) is an open-source personal AI assistant written in Rust. It connects to your existing messaging platforms (Telegram, Discord, WhatsApp, Signal, and more) and runs entirely on your own machine — no cloud dependency, no data leaving your device.

Compared to the TypeScript reference implementation (OpenClaw), IronClaw ships as a single native binary, starts faster, uses less memory, and is easier to audit for security.

## What AllyClaw Adds

IronClaw does not yet have text-to-speech output for agent responses. AllyClaw's primary goal is to fill this gap and make the full experience accessible without a screen:

| Feature | Status |
|---------|--------|
| **Voice-guided setup** — installer speaks every step aloud, no mouse required | ✅ Done |
| **TTS for agent responses** — all replies read aloud via Edge TTS / OpenAI / ElevenLabs | 🚧 In development |
| **Screen reader compatibility** — web UI audited for NVDA, JAWS, VoiceOver | 🔮 Planned |
| **Keyboard-first navigation** — all operations completable without a mouse | 🔮 Planned |
| **High-contrast theme** — for low-vision users | 🔮 Planned |

## Quick Start

**Requirements:** Node.js ≥ 18 (only for this setup script — IronClaw itself is a native binary)

```bash
git clone https://github.com/your-org/allyclaw.git
cd allyclaw
node setup.mjs
```

The setup script will:

1. Speak a welcome message using your system's built-in TTS — no configuration needed
2. Ask your language preference for voice output
3. Install IronClaw if not already present
4. Ask which AI provider to use (NEAR AI is the default — free, browser login, no API key)
5. Write settings to `~/.ironclaw/.env`
6. Optionally run `ironclaw onboard` to configure messaging channels
7. Optionally start the IronClaw background service

All prompts are spoken aloud **and** printed to the terminal so braille display users also receive them.

### Platform TTS used during setup

| Platform | Engine |
|----------|--------|
| Windows  | PowerShell `System.Speech.SpeechSynthesizer` (built-in, no install) |
| macOS    | `say` command (built-in) |
| Linux    | `espeak-ng`, `espeak`, `spd-say`, or `festival` (first available) |

## Installing IronClaw Manually

If you prefer to install IronClaw yourself before running the script:

```bash
# Windows (PowerShell)
irm https://github.com/nearai/ironclaw/releases/latest/download/ironclaw-installer.ps1 | iex

# macOS / Linux
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/nearai/ironclaw/releases/latest/download/ironclaw-installer.sh | sh

# macOS with Homebrew
brew install ironclaw

# From source (requires Rust)
cargo install ironclaw
```

## Upstream

IronClaw is included as a git submodule:

```bash
git submodule update --init
```

## Contributing

AllyClaw especially welcomes contributions in:

- TTS output integration (the core missing piece in IronClaw)
- Testing and feedback from visually impaired users
- Screen reader and ARIA auditing of the IronClaw web UI
- Translations for the setup script voice prompts

Please open an Issue before submitting a PR.

## Acknowledgements

- [IronClaw](https://github.com/nearai/ironclaw) — upstream project (MIT License)
- [OpenClaw](https://openclaw.ai/) — TypeScript reference implementation

## License

MIT


## Buy Me Coffee

    Bitcoin: bc1pjd7gc79yw7fqek9w6fwlkw28ad52vu8v90s4vy9d52g5pja2nn5sp56kqn
    ETH: 0xd799eba64aaf9cfd2169afc9685494a61d23012d
    Solana: C324pWC11MtAyp9wkRAqJqVFduymb6QjJC4bsF9wrdkz