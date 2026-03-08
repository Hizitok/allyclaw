#!/usr/bin/env node
/**
 * AllyClaw Health Check Script
 *
 * Verifies that OpenClaw or IronClaw is properly installed and configured.
 *
 * Usage:
 *   node healthcheck.mjs              # Interactive
 *   node healthcheck.mjs --openclaw   # Check OpenClaw only
 *   node healthcheck.mjs --ironclaw   # Check IronClaw only
 *   node healthcheck.mjs --json       # JSON output
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync, spawnSync } from 'child_process';
import https from 'https';
import http from 'http';

const PLATFORM = process.platform;

// CLI Arguments
const args = process.argv.slice(2);
const CLI = {
  openclaw: args.includes('--openclaw'),
  ironclaw: args.includes('--ironclaw'),
  json: args.includes('--json'),
  help: args.includes('--help') || args.includes('-h'),
};

if (CLI.help) {
  console.log(`
AllyClaw Health Check

Usage: node healthcheck.mjs [options]

Options:
  --openclaw    Check OpenClaw only
  --ironclaw    Check IronClaw only
  --json        Output JSON format
  -h, --help    Show this help
`);
  process.exit(0);
}

// Determine which to check
let checkOpenClaw = CLI.openclaw;
let checkIronClaw = CLI.ironclaw;
if (!checkOpenClaw && !checkIronClaw) {
  checkOpenClaw = true;
  checkIronClaw = true;
}

// Paths
const OPENCLAW_DIR = path.join(os.homedir(), '.openclaw');
const OPENCLAW_CONFIG = path.join(OPENCLAW_DIR, 'openclaw.json');
const IRONCLAW_DIR = path.join(os.homedir(), '.ironclaw');
const IRONCLAW_CONFIG = path.join(IRONCLAW_DIR, '.env');

const results = { timestamp: new Date().toISOString(), checks: [] };

function check(name, fn) {
  try {
    const result = fn();
    results.checks.push({ name, status: 'pass', ...result });
    return result;
  } catch (err) {
    results.checks.push({ name, status: 'fail', error: err.message });
    return null;
  }
}

function warn(name, fn) {
  try {
    const result = fn();
    results.checks.push({ name, status: 'warn', ...result });
    return result;
  } catch (err) {
    results.checks.push({ name, status: 'warn', error: err.message });
    return null;
  }
}

// ─── OpenClaw Checks ─────────────────────────────────────────────────────────

function checkOpenClawHealth() {
  if (!checkOpenClaw) return;

  // Binary check
  check('OpenClaw: installed', () => {
    const r = spawnSync('npx', ['openclaw', '--version'], { stdio: 'pipe' });
    if (r.status !== 0) throw new Error('Not installed');
    return { version: r.stdout?.toString().trim() };
  });

  // Config check
  check('OpenClaw: config exists', () => {
    if (!fs.existsSync(OPENCLAW_CONFIG)) throw new Error('Config not found');
    return { path: OPENCLAW_CONFIG };
  });

  // Config valid
  check('OpenClaw: config valid', () => {
    const cfg = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG, 'utf8'));
    return { hasTts: !!cfg.messages?.tts };
  });

  // TTS check
  warn('OpenClaw: TTS configured', () => {
    const cfg = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG, 'utf8'));
    const tts = cfg.messages?.tts;
    if (!tts || tts.auto === 'off') throw new Error('TTS not enabled');
    return { provider: tts.provider, auto: tts.auto };
  });

  // Gateway check
  check('OpenClaw: gateway reachable', () => {
    return new Promise((resolve, reject) => {
      const req = http.get('http://127.0.0.1:18789', (res) => {
        resolve({ statusCode: res.statusCode });
      });
      req.on('error', () => reject(new Error('Gateway not running')));
      req.setTimeout(3000, () => { req.destroy(); reject(new Error('Connection timeout')); });
    });
  });
}

// ─── IronClaw Checks ───────────────────────────────────────────────────────

function checkIronClawHealth() {
  if (!checkIronClaw) return;

  // Binary check
  check('IronClaw: installed', () => {
    const r = spawnSync('ironclaw', ['--version'], { stdio: 'pipe' });
    if (r.status !== 0) throw new Error('Not installed');
    return { version: r.stdout?.toString().trim() };
  });

  // Config check
  warn('IronClaw: config exists', () => {
    if (!fs.existsSync(IRONCLAW_CONFIG)) throw new Error('Config not found');
    return { path: IRONCLAW_CONFIG };
  });

  // LLM backend check
  warn('IronClaw: LLM backend configured', () => {
    const env = fs.existsSync(IRONCLAW_CONFIG)
      ? fs.readFileSync(IRONCLAW_CONFIG, 'utf8').split('\n')
          .filter(l => l.startsWith('LLM_BACKEND='))
          .map(l => l.split('=')[1])[0]
      : null;
    if (!env) throw new Error('LLM_BACKEND not set');
    return { backend: env };
  });

  // Service check
  warn('IronClaw: service status', () => {
    try {
      const r = spawnSync('ironclaw', ['status'], { stdio: 'pipe' });
      return { output: r.stdout?.toString().trim() || 'unknown' };
    } catch {
      throw new Error('Service not running');
    }
  });
}

// ─── System Checks ──────────────────────────────────────────────────────────

check('System: Node.js version', () => {
  const [major] = process.versions.node.split('.');
  if (parseInt(major) < 18) throw new Error('Node.js 18+ required');
  return { version: process.versions.node };
});

check('System: Platform', () => {
  return { platform: PLATFORM };
});

// Run checks
(async () => {
  checkOpenClawHealth();
  checkIronClawHealth();

  // If JSON output
  if (CLI.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  // Summary
  console.log('\n=== AllyClaw Health Check ===\n');

  let passed = 0, failed = 0, warned = 0;
  for (const c of results.checks) {
    const icon = c.status === 'pass' ? '✓' : c.status === 'fail' ? '✗' : '⚠';
    console.log(`  ${icon} ${c.name}`);
    if (c.status === 'pass') passed++;
    else if (c.status === 'fail') failed++;
    else warned++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed, ${warned} warnings\n`);

  if (failed > 0) {
    console.log('❌ Some checks failed. Run with --json for details.\n');
    process.exit(1);
  } else {
    console.log('✅ All checks passed.\n');
    process.exit(0);
  }
})();
