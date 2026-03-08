#!/usr/bin/env node
/**
 * AllyClaw Setup Script
 *
 * One-click accessible setup for OpenClaw or IronClaw.
 * Every prompt is spoken aloud via the system's built-in TTS — no screen
 * reader or mouse required.
 *
 * Platforms: Windows, macOS, Linux
 * Requirements: Node.js >= 18
 */

import { execSync, spawnSync } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── Platform TTS ─────────────────────────────────────────────────────────────

const PLATFORM = process.platform; // 'win32' | 'darwin' | 'linux'

function speak(text) {
  console.log(`\n  ${text}`);
  const safe = text.replace(/['"\\`]/g, ' ');
  try {
    if (PLATFORM === 'win32') {
      execSync(
        `powershell -NoProfile -NonInteractive -Command `+
        `"Add-Type -AssemblyName System.Speech; `+
        `(New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('${safe.replace(/'/g, ' ')}')"`,
        { stdio: 'ignore', timeout: 30_000 }
      );
    } else if (PLATFORM === 'darwin') {
      execSync(`say "${safe}"`, { stdio: 'ignore', timeout: 30_000 });
    } else {
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

function ask(question) {
  speak(question);
  return new Promise(resolve => rl.question('  > ', answer => resolve(answer.trim())));
}

async function confirm(question) {
  const a = await ask(`${question}  (press Enter for yes, type n then Enter for no)`);
  return a === '' || /^y/i.test(a);
}

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

// ─── Common helpers ────────────────────────────────────────────────────────────

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

function readJsonConfig(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return null; }
}

function backupConfig(filePath) {
  if (fs.existsSync(filePath)) {
    const backup = `${filePath}.ally-backup-${Date.now()}`;
    fs.copyFileSync(filePath, backup);
    speak(`Backed up existing config to ${path.basename(backup)}.`);
    return true;
  }
  return false;
}

// ─── OpenClaw (TypeScript) ────────────────────────────────────────────────────

function isOpenClawInstalled() {
  const r = spawnSync('npx', ['openclaw', '--version'], { stdio: 'pipe' });
  return r.status === 0;
}

function installOpenClaw() {
  speak('Installing OpenClaw via npm. This may take a few minutes.');
  execSync('npm install -g openclaw@latest', { stdio: 'inherit', timeout: 180_000 });
}

function getOpenClawConfigPath() {
  return path.join(os.homedir(), '.openclaw', 'openclaw.json');
}

function configureOpenClaw(ttsProvider, edgeVoice) {
  const configPath = getOpenClawConfigPath();
  const dir = path.dirname(configPath);
  fs.mkdirSync(dir, { recursive: true });

  backupConfig(configPath);

  const existing = readJsonConfig(configPath) || {};
  const updates = {
    messages: {
      tts: {
        auto: 'always',
        mode: 'final',
        provider: ttsProvider,
      },
    },
  };

  if (ttsProvider === 'edge') {
    updates.messages.tts.edge = {
      enabled: true,
      voice: edgeVoice,
    };
  }

  const merged = JSON.parse(JSON.stringify(existing)); // deep clone base
  const merge = (target, source) => {
    for (const key of Object.keys(source)) {
      if (
        source[key] !== null &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null
      ) {
        merge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  };
  merge(merged, updates);

  fs.writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf8');
  return configPath;
}

// ─── IronClaw (Rust) ──────────────────────────────────────────────────────────

const IRONCLAW_INSTALLER = 'https://github.com/nearai/ironclaw/releases/latest/download';

function isIronClawInstalled() {
  const r = spawnSync('ironclaw', ['--version'], { stdio: 'pipe' });
  return r.status === 0;
}

function installIronClaw() {
  if (PLATFORM === 'win32') {
    execSync(
      `powershell -NoProfile -Command "irm ${IRONCLAW_INSTALLER}/ironclaw-installer.ps1 | iex"`,
      { stdio: 'inherit', timeout: 120_000 }
    );
  } else if (PLATFORM === 'darwin') {
    const brew = spawnSync('brew', ['--version'], { stdio: 'pipe' });
    if (brew.status === 0) {
      execSync('brew install ironclaw', { stdio: 'inherit', timeout: 120_000 });
    } else {
      execSync(
        `curl --proto '=https' --tlsv1.2 -LsSf ${IRONCLAW_INSTALLER}/ironclaw-installer.sh | sh`,
        { stdio: 'inherit', timeout: 120_000 }
      );
    }
  } else {
    execSync(
      `curl --proto '=https' --tlsv1.2 -LsSf ${IRONCLAW_INSTALLER}/ironclaw-installer.sh | sh`,
      { stdio: 'inherit', timeout: 120_000 }
    );
  }
}

function getIronClawEnvPath() {
  return path.join(os.homedir(), '.ironclaw', '.env');
}

function configureIronClaw(provider, apiKey) {
  const envPath = getIronClawEnvPath();
  fs.mkdirSync(path.dirname(envPath), { recursive: true });

  backupConfig(envPath);

  const existing = readEnvFile(envPath);
  const updates = { LLM_BACKEND: provider };
  if (apiKey) {
    if (provider === 'anthropic') updates.ANTHROPIC_API_KEY = apiKey;
    else if (provider === 'openai') updates.OPENAI_API_KEY = apiKey;
  }

  fs.writeFileSync(
    envPath,
    Object.entries({ ...existing, ...updates })
      .map(([k, v]) => `${k}=${v}`)
      .join('\n') + '\n',
    'utf8'
  );
  return envPath;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  speak(
    'Welcome to AllyClaw. This script will set up an accessible AI assistant ' +
    'for visually impaired users. Every step will be announced aloud.'
  );

  // ── Select project ──
  const project = await choose(
    'Which project would you like to set up?',
    [
      {
        label: 'OpenClaw (TypeScript) — TTS already supported, more features',
        value: 'openclaw',
      },
      {
        label: 'IronClaw (Rust) — faster, smaller, easier to audit',
        value: 'ironclaw',
      },
    ]
  );
  speak(`Selected ${project.value === 'openclaw' ? 'OpenClaw' : 'IronClaw'}.`);

  // ── Language ──
  const langChoice = await choose(
    'What language do you prefer for voice output?',
    [
      { label: 'English',            value: 'en', edgeVoice: 'en-US-AriaNeural' },
      { label: 'Chinese (Simplified)', value: 'zh', edgeVoice: 'zh-CN-XiaoxiaoNeural' },
      { label: 'Chinese (Traditional)', value: 'zh-TW', edgeVoice: 'zh-TW-HsiaoYuNeural' },
      { label: 'Japanese',           value: 'ja', edgeVoice: 'ja-JP-NanamiNeural' },
      { label: 'Korean',             value: 'ko', edgeVoice: 'ko-KR-SunHiNeural' },
      { label: 'French',            value: 'fr', edgeVoice: 'fr-FR-DeniseNeural' },
      { label: 'German',            value: 'de', edgeVoice: 'de-DE-KatjaNeural' },
      { label: 'Spanish',           value: 'es', edgeVoice: 'es-ES-ElviraNeural' },
      { label: 'Portuguese',        value: 'pt', edgeVoice: 'pt-BR-FranciscaNeural' },
      { label: 'Russian',           value: 'ru', edgeVoice: 'ru-RU-SvetlanaNeural' },
    ]
  );
  speak(`Language set to ${langChoice.label}.`);

  // ── Project-specific setup ──
  if (project.value === 'openclaw') {
    await setupOpenClaw(langChoice);
  } else {
    await setupIronClaw();
  }

  speak('Setup complete. Thank you!');
  rl.close();
}

async function setupOpenClaw(lang) {
  // Install
  if (isOpenClawInstalled()) {
    const version = spawnSync('npx', ['openclaw', '--version'], { stdio: 'pipe' })
      .stdout?.toString().trim() ?? 'unknown';
    speak(`OpenClaw is already installed. Version: ${version}.`);
  } else {
    speak('OpenClaw is not installed. Installing now.');
    try { installOpenClaw(); }
    catch {
      speak('Installation failed. Run: npm install -g openclaw@latest');
      process.exit(1);
    }
  }

  // TTS provider
  const ttsProvider = await choose(
    'Which text-to-speech provider for agent responses?',
    [
      { label: 'Microsoft Edge TTS — free, no API key required', value: 'edge' },
      { label: 'OpenAI TTS — requires OpenAI API key', value: 'openai' },
      { label: 'ElevenLabs — requires API key', value: 'elevenlabs' },
    ]
  );
  speak(`Selected ${ttsProvider.label}.`);

  // Write config
  speak('Writing accessibility configuration.');
  const configPath = configureOpenClaw(ttsProvider.value, lang.edgeVoice);
  speak(`Configuration written to ${configPath}.`);

  // Onboard
  const runOnboard = await confirm('Run the OpenClaw onboarding wizard now?');
  if (runOnboard) {
    speak('Launching OpenClaw onboarding.');
    try { execSync('npx openclaw onboard', { stdio: 'inherit' }); }
    catch { speak('Onboarding exited.'); }
  }
}

async function setupIronClaw() {
  // Install
  if (isIronClawInstalled()) {
    const version = spawnSync('ironclaw', ['--version'], { stdio: 'pipe' })
      .stdout?.toString().trim() ?? 'unknown';
    speak(`IronClaw is already installed. Version: ${version}.`);
  } else {
    speak('IronClaw is not installed. Installing now.');
    try { installIronClaw(); }
    catch {
      speak('Installation failed. See the README for manual install instructions.');
      process.exit(1);
    }
  }

  // LLM provider
  const provider = await choose(
    'Which AI provider?',
    [
      { label: 'NEAR AI (default, free, browser login)', value: 'nearai' },
      { label: 'Anthropic Claude (requires API key)', value: 'anthropic' },
      { label: 'OpenAI GPT (requires API key)', value: 'openai' },
      { label: 'Ollama (local, no API key)', value: 'ollama' },
    ]
  );

  let apiKey = '';
  if (provider.value === 'anthropic' || provider.value === 'openai') {
    apiKey = await ask(`Enter your ${provider.value === 'anthropic' ? 'Anthropic' : 'OpenAI'} API key.`);
  }

  // Write config
  speak('Writing configuration.');
  const configPath = configureIronClaw(provider.value, apiKey);
  speak(`Configuration written to ${configPath}.`);

  // TTS note
  speak(
    'Note: Text-to-speech for IronClaw is currently in development. ' +
    'Once available, agent responses will be read aloud automatically.'
  );

  // Onboard
  const runOnboard = await confirm('Run the IronClaw onboarding wizard now?');
  if (runOnboard) {
    speak('Launching IronClaw onboarding.');
    try { execSync('ironclaw onboard', { stdio: 'inherit' }); }
    catch { speak('Onboarding exited.'); }
  }

  // Start service
  const startService = await confirm('Start the IronClaw service in the background?');
  if (startService) {
    try {
      execSync('ironclaw service start', { stdio: 'inherit' });
      speak('Service started.');
    } catch { speak('Could not start service.'); }
  }
}

main().catch(err => {
  speak('Error: ' + err.message);
  console.error(err);
  rl.close();
  process.exit(1);
});
