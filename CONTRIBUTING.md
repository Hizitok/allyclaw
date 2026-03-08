# Contributing to AllyClaw

Thank you for your interest in making AI assistants accessible to everyone!

## Quick Start

```bash
git clone https://github.com/your-org/allyclaw.git
cd allyclaw
node setup.mjs --help
```

## Project Structure

```
allyclaw/
├── setup.mjs          # Main setup script (interactive + non-interactive)
├── uninstall.mjs      # Cleanup script
├── healthcheck.mjs   # Verify installation
├── test/             # Unit tests
├── config/           # Sample configurations
├── ACCESSIBILITY_PLAN.md  # Roadmap
└── ironclaw/        # Git submodule (IronClaw upstream)
```

## Scripts

| Script | Description |
|--------|-------------|
| `node setup.mjs` | Interactive setup |
| `node setup.mjs --non-interactive --project openclaw --lang en` | Automated setup |
| `node uninstall.mjs --all` | Remove everything |
| `node healthcheck.mjs` | Verify installation |
| `node test/setup.test.mjs` | Run unit tests |

## Development

### Adding a new language

1. Add language option in `setup.mjs` (around line 250):
   ```javascript
   { label: 'Language Name', value: 'code', edgeVoice: 'Voice-ID' },
   ```

2. Add voice mapping to `LANG_MAP`:
   ```javascript
   'code': 'Voice-ID',
   ```

3. Add label to `LANGUAGE_LABELS`:
   ```javascript
   'code': 'Language Name',
   ```

4. Run tests:
   ```bash
   node test/setup.test.mjs
   ```

### Adding a new platform check

Platform detection uses `process.platform`:
- `win32` - Windows
- `darwin` - macOS
- `linux` - Linux

Add platform-specific logic in the relevant function.

## Testing

Run the test suite:

```bash
node test/setup.test.mjs
```

## Code Style

- Use ES modules (`import`/`export`)
- Use `const`/`let` instead of `var`
- Use async/await for asynchronous operations
- Add JSDoc comments for functions

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Korean language support
fix: handle missing config file
docs: update installation instructions
test: add env file parsing tests
```

## Issues

Before creating an issue:

1. Check if the issue already exists
2. Run `node healthcheck.mjs --json` and include the output
3. Include steps to reproduce

## Accessibility Standards

When modifying the setup script or adding features:

1. **Voice output** - Every prompt must be spoken via `speak()`
2. **Terminal output** - Always print what is spoken
3. **Keyboard-only** - No mouse required for any operation
4. **Screen reader friendly** - Use standard terminal conventions

## Contact

- Issues: https://github.com/your-org/allyclaw/issues
- Discussions: https://github.com/your-org/allyclaw/discussions
