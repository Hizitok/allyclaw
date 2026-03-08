#!/usr/bin/env node
/**
 * AllyClaw Setup Script
 *
 * One-click accessible IronClaw configuration for visually impaired users.
 * Every prompt is spoken aloud via the system's built-in TTS — no screen
 * reader or mouse required to complete the setup.
 *
 * Platforms: Windows, macOS, Linux
 * Requirements: Node.js >= 18 (used only for this script; IronClaw itself
 *               is a native binary with no Node dependency)
 */

import { execSync, spawnSync } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import os from 'os';
// ─── Platform TTS ─────────────────────────────────────────────────────────────

const PLATFORM = process.platform; // 'win32' | 'darwin' | 'linux'

/**
 * Speak text using the system's built-in TTS engine, then print it.
 * Printing ensures braille display users and terminal log readers also get it.
 */
function speak(text) {
  console.log(`\n  ${text}`);
  const safe = text.replace(/['"\\`]/g, ' ');
  try {
    if (PLATFORM === 'win32') {
      // Windows: PowerShell SpeechSynthesizer (no extra install needed)
      execSync(
        `powershell -NoProfile -NonInteractive -Command `+
        `"Add-Type -AssemblyName System.Speech; `+
        `(New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('${safe.replace(/'/g, ' ')}')"`,
        { stdio: 'ignore', timeout: 30_000 }
      );
    } else if (PLATFORM === 'darwin') {
      execSync(`say "${safe}"`, { stdio: 'ignore', timeout: 30_000 });
    } else {
      // Linux: try each engine in order
      for (const cmd of [
        `espeak-ng "${safe}"`,
        `espeak "${safe}"`,
        `spd-say "${safe}"`,
        `echo "${safe}" | festival --tts`,
      ]) {
        try { execSync(cmd, { stdio: 'ignore', timeout: 10_000 }); break; }
        catch { /* try next */ }
      }
    }
  } catch { /* TTS failure is non-fatal */ }
}

// ─── Readline helpers ──────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

/** Ask a question aloud and wait for a line of input. */
function ask(question) {
  speak(question);
  return new Promise(resolve => rl.question('  > ', answer => resolve(answer.trim())));
}

/** Yes/no confirmation. Empty input = yes. */
async function confirm(question) {
  const a = await ask(`${question}  (press Enter for yes, type n then Enter for no)`);
  return a === '' || /^y/i.test(a);
}

/** Numbered menu. Returns the selected choice object. */
async function choose(question, choices) {
  const list = choices.map((c, i) => `  ${i + 1}. ${c.label}`).join('\n');
  speak(`${question}\n${list}\nType a number and press Enter.`);
  console.log(list);
  while (true) {
    const n = parseInt(await new Promise(r => rl.question('  > ', r)), 10);
    if (n >= 1 && n <= choices.length) return choices[n - 1];
    speak(`Please enter a number between 1 and ${choices.length}.`);
  }
}

// ─── IronClaw installation ─────────────────────────────────────────────────────

const INSTALLER_BASE =
  'https://github.com/nearai/ironclaw/releases/latest/download';

function isIronclawInstalled() {
  const r = spawnSync('ironclaw', ['--version'], { stdio: 'pipe' });
  return r.status === 0;
}

function installIronclaw() {
  if (PLATFORM === 'win32') {
    // PowerShell one-liner from the official README
    execSync(
      `powershell -NoProfile -Command "irm ${INSTALLER_BASE}/ironclaw-installer.ps1 | iex"`,
      { stdio: 'inherit', timeout: 120_000 }
    );
  } else if (PLATFORM === 'darwin') {
    // Try Homebrew first (handles PATH reliably), fall back to shell installer
    const brew = spawnSync('brew', ['--version'], { stdio: 'pipe' });
    if (brew.status === 0) {
      execSync('brew install ironclaw', { stdio: 'inherit', timeout: 120_000 });
    } else {
      execSync(
        `curl --proto '=https' --tlsv1.2 -LsSf ${INSTALLER_BASE}/ironclaw-installer.sh | sh`,
        { stdio: 'inherit', timeout: 120_000 }
      );
    }
  } else {
    execSync(
      `curl --proto '=https' --tlsv1.2 -LsSf ${INSTALLER_BASE}/ironclaw-installer.sh | sh`,
      { stdio: 'inherit', timeout: 120_000 }
    );
  }
}

// ─── IronClaw config helpers ───────────────────────────────────────────────────
// IronClaw reads config from env vars, which can be persisted in
// ~/.ironclaw/.env (loaded by dotenvy at startup).

function getIronclawEnvPath() {
  return path.join(os.homedir(), '.ironclaw', '.env');
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const vars = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return vars;
}

function writeEnvFile(filePath, vars) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const lines = Object.entries(vars).map(([k, v]) => `${k}=${v}`);
  // Preserve existing keys not touched by AllyClaw
  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
}

function mergeEnv(updates) {
  const envPath = getIronclawEnvPath();
  // Back up if exists
  if (fs.existsSync(envPath)) {
    const backup = `${envPath}.ally-backup-${Date.now()}`;
    fs.copyFileSync(envPath, backup);
    speak(`Backed up existing config to ${path.basename(backup)}.`);
  }
  const existing = readEnvFile(envPath);
  writeEnvFile(envPath, { ...existing, ...updates });
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  speak(
    'Welcome to AllyClaw. This script will install and configure IronClaw, ' +
    'an open-source AI assistant, with accessibility settings for visually impaired users. ' +
    'Every step will be announced aloud.'
  );

  // ── Language / voice preference ──
  const langChoice = await choose(
    'What language do you prefer for voice output?',
    [
      { label: 'English',            value: 'en', envVoice: 'en-US-AriaNeural' },
      { label: 'Chinese (Mainland)', value: 'zh', envVoice: 'zh-CN-XiaoxiaoNeural' },
      { label: 'Chinese (Taiwan)',   value: 'zh-TW', envVoice: 'zh-TW-HsiaoYuNeural' },
      { label: 'Japanese',           value: 'ja', envVoice: 'ja-JP-NanamiNeural' },
    ]
  );
  speak(`Language set to ${langChoice.label}.`);

  // ── Install IronClaw ──
  if (isIronclawInstalled()) {
    const version = spawnSync('ironclaw', ['--version'], { stdio: 'pipe' })
      .stdout?.toString().trim() ?? 'unknown';
    speak(`IronClaw is already installed. Version: ${version}.`);
  } else {
    speak('IronClaw is not installed. Installing now. This may take a minute.');
    try {
      installIronclaw();
      speak('IronClaw installed successfully.');
    } catch (e) {
      speak(
        'Installation failed. ' +
        'On Windows, run: irm https://github.com/nearai/ironclaw/releases/latest/download/ironclaw-installer.ps1 | iex  ' +
        'On macOS or Linux, run: curl --proto https --tlsv1.2 -LsSf https://github.com/nearai/ironclaw/releases/latest/download/ironclaw-installer.sh | sh  ' +
        'Then run this script again.'
      );
      process.exit(1);
    }
  }

  // ── LLM provider ──
  speak(
    'IronClaw needs a language model to power the AI assistant. ' +
    'NEAR AI is the default and requires no separate API key — ' +
    'it opens a browser for a one-time login.'
  );
  const providerChoice = await choose(
    'Which AI provider would you like to use?',
    [
      { label: 'NEAR AI (default, free, browser login)',   value: 'nearai',    envKey: null },
      { label: 'Anthropic Claude (requires API key)',      value: 'anthropic', envKey: 'ANTHROPIC_API_KEY' },
      { label: 'OpenAI GPT (requires API key)',            value: 'openai',    envKey: 'OPENAI_API_KEY' },
      { label: 'Ollama — local inference, no API key',    value: 'ollama',    envKey: null },
    ]
  );

  const envUpdates = { LLM_BACKEND: providerChoice.value };

  if (providerChoice.envKey) {
    const key = await ask(
      `Enter your ${providerChoice.label.split(' ')[0]} API key. ` +
      `It will be stored in ${getIronclawEnvPath()}.`
    );
    if (key) {
      envUpdates[providerChoice.envKey] = key;
    } else {
      speak('No key entered. You can add it later to ~/.ironclaw/.env');
    }
  }

  // ── Write env config ──
  speak('Writing configuration.');
  mergeEnv(envUpdates);
  speak(`Configuration written to ${getIronclawEnvPath()}.`);

  // ── TTS note ──
  speak(
    'Note on text-to-speech: native TTS output for agent responses is the core feature ' +
    'AllyClaw is adding to IronClaw. It is currently in development. ' +
    'Once available, all agent replies will be read aloud automatically.'
  );

  // ── Run ironclaw onboard ──
  const runOnboard = await confirm(
    'Would you like to run the IronClaw setup wizard now? ' +
    'It will guide you through messaging channel configuration. '
  );
  if (runOnboard) {
    speak('Launching IronClaw onboarding wizard. Follow the on-screen prompts.');
    try {
      execSync('ironclaw onboard', { stdio: 'inherit' });
    } catch {
      speak('Onboarding exited. You can run  ironclaw onboard  at any time to continue.');
    }
  }

  // ── Start service ──
  const startService = await confirm(
    'Start the IronClaw service in the background now?'
  );
  if (startService) {
    speak('Starting IronClaw service.');
    try {
      execSync('ironclaw service start', { stdio: 'inherit' });
      speak('IronClaw is running.');
    } catch {
      speak('Could not start the service. Run  ironclaw service start  manually.');
    }
  }

  // ── Done ──
  speak(
    'AllyClaw setup complete. ' +
    'IronClaw is configured with your chosen AI provider. ' +
    'Send a message through any channel you set up to talk to your assistant. ' +
    'For help, see the README or open an issue on GitHub. Thank you.'
  );

  rl.close();
}

main().catch(err => {
  speak('An unexpected error occurred: ' + err.message);
  console.error(err);
  rl.close();
  process.exit(1);
});
