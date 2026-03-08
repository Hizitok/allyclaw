# AllyClaw Accessibility Plan

This document outlines the roadmap for making OpenClaw and IronClaw fully accessible to visually impaired users.

## Status Legend

- ✅ **Done** - Completed and working
- 🚧 **In Progress** - Actively being developed
- 🔮 **Planned** - On the roadmap
- ❌ **Blocked** - Waiting on upstream or external dependency

---

## Phase 1: Voice-Guided Setup (Completed)

### ✅ Setup Script

- [x] Platform-specific TTS (Windows PowerShell, macOS say, Linux espeak)
- [x] Language selection (10 languages supported)
- [x] Auto-install OpenClaw or IronClaw
- [x] Configuration generation
- [x] Onboarding wizard launch

**Location:** `setup.mjs`

---

## Phase 2: Text-to-Speech Output

### OpenClaw (TypeScript)

| Feature | Status | Notes |
|---------|--------|-------|
| Edge TTS | ✅ Done | Built-in, free |
| OpenAI TTS | ✅ Done | Requires API key |
| ElevenLabs TTS | ✅ Done | Requires API key |
| Auto-TTS mode | ✅ Done | `messages.tts.auto: "always"` |
| Voice selection | ✅ Done | Configurable per language |

**Location:** `openclaw/src/tts/`

### IronClaw (Rust)

| Feature | Status | Notes |
|---------|--------|-------|
| TTS integration | 🔮 Planned | Requires port from OpenClaw |
| Edge TTS | 🔮 Planned | Use `node-edge-tts` or Rust equivalent |
| OpenAI TTS | 🔮 Planned | Use `reqwest` + OpenAI API |
| ElevenLabs TTS | 🔮 Planned | Use `reqwest` + ElevenLabs API |
| Auto-TTS mode | 🔮 Planned | Depends on TTS integration |

**Tasks:**
1. Create `src/tts/` module in IronClaw
2. Implement Edge TTS using `reqwest` + Microsoft Speech API
3. Add TTS config to database settings
4. Wire TTS into message handling pipeline

---

## Phase 3: Web UI Accessibility

### OpenClaw (Lit.js Web Components)

| Feature | Status | Priority |
|---------|--------|----------|
| ARIA labels | 🔮 Planned | High |
| Focus management | 🔮 Planned | High |
| Keyboard navigation | 🔮 Planned | High |
| Screen reader announcements | 🔮 Planned | Medium |
| High contrast theme | 🔮 Planned | Medium |
| Skip links | 🔮 Planned | Medium |
| Semantic HTML | 🔮 Planned | High |

**Location:** `openclaw/ui/src/ui/`

**Tasks:**
1. Audit all components with NVDA / JAWS / VoiceOver
2. Add `aria-label`, `aria-live`, `role` attributes
3. Implement focus trap for modals
4. Add keyboard shortcuts (Tab, Enter, Escape, Arrow keys)
5. Create high-contrast CSS theme
6. Add "skip to main content" link

### IronClaw (Rust Web UI)

| Feature | Status | Priority |
|---------|--------|----------|
| ARIA support | 🔮 Planned | High |
| Keyboard navigation | 🔮 Planned | High |
| Screen reader support | 🔮 Planned | Medium |
| High contrast theme | 🔮 Planned | Medium |

**Note:** IronClaw's web UI is less mature; easier to build accessibility in from scratch.

---

## Phase 4: Voice Control

| Feature | Status | Notes |
|---------|--------|-------|
| Voice commands | 🔮 Planned | "Open settings", "Send message" |
| Wake word detection | 🔮 Planned | Similar to Alexa/Siri |
| Voice navigation | 🔮 Planned | Navigate menus by voice |

---

## Phase 5: Testing & Feedback

### Testing Checklist

- [ ] Test with NVDA on Windows
- [ ] Test with JAWS on Windows
- [ ] Test with VoiceOver on macOS
- [ ] Test with Orca on Linux
- [ ] Test with braille display
- [ ] Test low-vision users with high contrast mode
- [ ] Test completely blind users with screen reader

### User Research

- [ ] Interview 5+ visually impaired users
- [ ] Document pain points
- [ ] Prioritize features based on feedback
- [ ] Create user stories

---

## Contributing

### Skills Needed

- Screen reader testing expertise
- WAI-ARIA knowledge
- Rust development (for IronClaw TTS)
- TypeScript/Lit.js development (for OpenClaw UI)
- User experience research

### How to Help

1. **Test** - Try the setup script and report issues
2. **Code** - Pick a task from the roadmap above
3. **Design** - Propose accessible UI patterns
4. **Feedback** - Share your experience as a visually impaired user

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Survey](https://webaim.org/projects/screenreadersurvey/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

## Contact

- Issues: https://github.com/your-org/allyclaw/issues
- Discussions: https://github.com/your-org/allyclaw/discussions
