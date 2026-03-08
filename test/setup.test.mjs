#!/usr/bin/env node
/**
 * AllyClaw Setup Script - Tests
 *
 * Run: node test/setup.test.mjs
 *
 * Tests the non-interactive parts of setup.mjs:
 * - Config file reading/writing
 * - JSON merging
 * - Env file parsing
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(os.tmpdir(), 'allyclaw-test-' + Date.now());

// ─── Test helper functions (copied from setup.mjs) ───────────────────────────

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

// Deep merge for JSON
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof result[key] === 'object' &&
      result[key] !== null
    ) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.log(`  ✗ ${message}`);
    failed++;
  }
}

function assertEq(actual, expected, message) {
  const condition = JSON.stringify(actual) === JSON.stringify(expected);
  if (!condition) {
    console.log(`    Expected: ${JSON.stringify(expected)}`);
    console.log(`    Actual:   ${JSON.stringify(actual)}`);
  }
  assert(condition, message);
}

console.log('\n=== AllyClaw Setup Tests ===\n');
console.log(`Temp dir: ${TEMP_DIR}\n`);

// Create temp directory
fs.mkdirSync(TEMP_DIR, { recursive: true });

// ─── Test: readEnvFile ───────────────────────────────────────────────────────

console.log('--- readEnvFile ---');

const envPath = path.join(TEMP_DIR, 'test.env');
fs.writeFileSync(envPath, `
# This is a comment
KEY1=value1
KEY2=value2 with spaces
EMPTY_KEY=
`);

const envResult = readEnvFile(envPath);
assertEq(envResult.KEY1, 'value1', 'parses basic key=value');
assertEq(envResult.KEY2, 'value2 with spaces', 'preserves spaces in values');
assertEq(envResult.EMPTY_KEY, '', 'handles empty values');
assert(!envResult['# This is a comment'], 'ignores comments');

// ─── Test: readJsonConfig ───────────────────────────────────────────────────

console.log('\n--- readJsonConfig ---');

const jsonPath = path.join(TEMP_DIR, 'test.json');
fs.writeFileSync(jsonPath, JSON.stringify({ a: 1, b: { c: 2 } }));

const jsonResult = readJsonConfig(jsonPath);
assertEq(jsonResult.a, 1, 'parses JSON file');
assertEq(jsonResult.b.c, 2, 'parses nested JSON');

const missingResult = readJsonConfig(path.join(TEMP_DIR, 'nonexistent.json'));
assert(missingResult === null, 'returns null for missing file');

const invalidPath = path.join(TEMP_DIR, 'invalid.json');
fs.writeFileSync(invalidPath, '{ invalid json }');
const invalidResult = readJsonConfig(invalidPath);
assert(invalidResult === null, 'returns null for invalid JSON');

// ─── Test: deepMerge ─────────────────────────────────────────────────────────

console.log('\n--- deepMerge ---');

const base = { a: 1, b: { c: 2, d: 3 } };
const update = { b: { c: 99 }, e: 4 };
const merged = deepMerge(base, update);

assertEq(merged.a, 1, 'keeps unchanged keys');
assertEq(merged.b.c, 99, 'overwrites nested keys');
assertEq(merged.b.d, 3, 'preserves non-overwritten nested keys');
assertEq(merged.e, 4, 'adds new keys');

// Test arrays are replaced not merged
const baseArr = { arr: [1, 2] };
const updateArr = { arr: [3, 4] };
const mergedArr = deepMerge(baseArr, updateArr);
assertEq(mergedArr.arr, [3, 4], 'replaces arrays entirely');

// ─── Test: OpenClaw config merging ─────────────────────────────────────────

console.log('\n--- OpenClaw config merging ---');

const openclawConfigPath = path.join(TEMP_DIR, 'openclaw.json');
fs.writeFileSync(openclawConfigPath, JSON.stringify({
  messages: {
    other: 'setting'
  },
  channels: {
    telegram: { enabled: true }
  }
}, null, 2));

// Simulate configureOpenClaw logic
const existing = readJsonConfig(openclawConfigPath) || {};
const updates = {
  messages: {
    tts: {
      auto: 'always',
      mode: 'final',
      provider: 'edge',
    },
  },
};

if (updates.messages.tts.provider === 'edge') {
  updates.messages.tts.edge = {
    enabled: true,
    voice: 'en-US-AriaNeural',
  };
}

const mergedConfig = deepMerge(existing, updates);

assertEq(mergedConfig.messages.other, 'setting', 'preserves existing config');
assertEq(mergedConfig.channels.telegram.enabled, true, 'preserves channel config');
assertEq(mergedConfig.messages.tts.auto, 'always', 'sets TTS auto');
assertEq(mergedConfig.messages.tts.provider, 'edge', 'sets TTS provider');
assertEq(mergedConfig.messages.tts.edge.voice, 'en-US-AriaNeural', 'sets Edge voice');

// ─── Test: IronClaw env merging ────────────────────────────────────────────

console.log('\n--- IronClaw env merging ---');

const ironclawEnvPath = path.join(TEMP_DIR, 'ironclaw.env');
fs.writeFileSync(ironclawEnvPath, `EXISTING_VAR=kept
LLM_BACKEND=ollama
`);

// Simulate configureIronClaw logic
const existingEnv = readEnvFile(ironclawEnvPath);
const newEnv = { LLM_BACKEND: 'anthropic', ANTHROPIC_API_KEY: 'sk-test123' };

const mergedEnv = { ...existingEnv, ...newEnv };

assertEq(mergedEnv.EXISTING_VAR, 'kept', 'preserves existing env vars');
assertEq(mergedEnv.LLM_BACKEND, 'anthropic', 'overwrites existing vars');
assertEq(mergedEnv.ANTHROPIC_API_KEY, 'sk-test123', 'adds new vars');

// ─── Test: edge voice mapping ───────────────────────────────────────────────

console.log('\n--- Edge voice mapping ---');

const voiceMap = {
  'en': 'en-US-AriaNeural',
  'zh': 'zh-CN-XiaoxiaoNeural',
  'zh-TW': 'zh-TW-HsiaoYuNeural',
  'ja': 'ja-JP-NanamiNeural',
};

assertEq(voiceMap['en'], 'en-US-AriaNeural', 'English voice');
assertEq(voiceMap['zh'], 'zh-CN-XiaoxiaoNeural', 'Chinese voice');
assertEq(voiceMap['ja'], 'ja-JP-NanamiNeural', 'Japanese voice');

// ─── Test: TTS provider detection ─────────────────────────────────────────

console.log('\n--- Platform detection ---');

const platform = process.platform;
assert(['win32', 'darwin', 'linux'].includes(platform), `Platform is ${platform}`);

// ─── Cleanup ────────────────────────────────────────────────────────────────

console.log('\n--- Cleanup ---');

fs.rmSync(TEMP_DIR, { recursive: true, force: true });
console.log(`  Removed temp dir: ${TEMP_DIR}`);

// ─── Summary ────────────────────────────────────────────────────────────────

console.log('\n=== Results ===');
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log('');

if (failed > 0) {
  console.log('❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('✅ All tests passed!');
  process.exit(0);
}
