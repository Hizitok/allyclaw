#!/usr/bin/env node
/**
 * AllyClaw Uninstall Script
 *
 * Removes AllyClaw configurations and optionally uninstalls OpenClaw/IronClaw.
 *
 * Usage:
 *   node uninstall.mjs              # Interactive
 *   node uninstall.mjs --all        # Remove everything
 *   node uninstall.mjs --config      # Remove config only
 *   node uninstall.mjs --services    # Remove services only
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync, spawnSync } from 'child_process';
import readline from 'readline';

const PLATFORM = process.platform;

// CLI Arguments
const args = process.argv.slice(2);
const CLI = {
  all: args.includes('--all'),
  config: args.includes('--config'),
  services: args.includes('--services'),
  keepConfig: args.includes('--keep-config'),
  keepServices: args.includes('--keep-services'),
  help: args.includes('--help') || args.includes('-h'),
  nonInteractive: args.includes('--yes') || args.includes('-y'),
};

if (CLI.help) {
  console.log(`
AllyClaw Uninstall Script

Usage: node uninstall.mjs [options]

Options:
  --all              Remove everything (config + services)
  --config           Remove config files only
  --services         Remove services only
  --keep-config      Keep config when using --all
  --keep-services    Keep services when using --all
  --yes, -y          Non-interactive mode (answer yes to all)
  -h, --help         Show this help

Examples:
  node uninstall.mjs
  node uninstall.mjs --all
  node uninstall.mjs --config
`);
  process.exit(0);
}

// Readline helpers
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(r => rl.question(q, r)); }
async function confirm(q) {
  if (CLI.nonInteractive) return true;
  const a = await ask(q + ' (y/N): ');
  return /^y/i.test(a);
}

// Paths
const OPENCLAW_DIR = path.join(os.homedir(), '.openclaw');
const IRONCLAW_DIR = path.join(os.homedir(), '.ironclaw');

function speak(text) {
  console.log('  ' + text);
}

async function main() {
  console.log('\n=== AllyClaw Uninstall ===\n');

  let removeConfig = CLI.all || CLI.config;
  let removeServices = CLI.all || CLI.services;

  if (!CLI.all && !CLI.config && !CLI.services) {
    console.log('What would you like to remove?');
    console.log('  1. Everything (config + services)');
    console.log('  2. Config files only');
    console.log('  3. Services only');
    console.log('  4. Cancel');

    const choice = await ask('Select: ');
    if (choice === '1') { removeConfig = true; removeServices = true; }
    else if (choice === '2') { removeConfig = true; removeServices = false; }
    else if (choice === '3') { removeConfig = false; removeServices = true; }
    else { console.log('Cancelled.'); rl.close(); return; }
  }

  // Confirm
  const items = [];
  if (removeConfig) items.push('configuration files');
  if (removeServices) items.push('services');
  const confirmMsg = `Remove ${items.join(' and ')}?`;
  if (!await confirm(confirmMsg)) {
    console.log('Cancelled.');
    rl.close();
    return;
  }

  // Remove config
  if (removeConfig) {
    speak('Removing OpenClaw config...');
    if (fs.existsSync(OPENCLAW_DIR)) {
      fs.rmSync(OPENCLAW_DIR, { recursive: true, force: true });
      speak(`Removed ${OPENCLAW_DIR}`);
    } else {
      speak('No OpenClaw config found.');
    }

    speak('Removing IronClaw config...');
    if (fs.existsSync(IRONCLAW_DIR)) {
      fs.rmSync(IRONCLAW_DIR, { recursive: true, force: true });
      speak(`Removed ${IRONCLAW_DIR}`);
    } else {
      speak('No IronClaw config found.');
    }
  }

  // Remove services
  if (removeServices) {
    speak('Removing services...');

    // OpenClaw
    try {
      execSync('npm uninstall -g openclaw', { stdio: 'ignore' });
      speak('Uninstalled OpenClaw (npm).');
    } catch {
      speak('OpenClaw not installed via npm, skipping.');
    }

    // IronClaw service
    try {
      execSync('ironclaw service stop', { stdio: 'ignore' });
    } catch { /* ignore */ }

    if (PLATFORM === 'darwin') {
      try {
        execSync('brew uninstall ironclaw', { stdio: 'ignore' });
        speak('Uninstalled IronClaw (Homebrew).');
      } catch { /* ignore */ }
    }

    speak('Note: If IronClaw was installed via installer script, manually remove:');
    speak('  - Binary: /usr/local/bin/ironclaw or ~/.local/bin/ironclaw');
    speak('  - LaunchAgent: ~/Library/LaunchAgents/com.ironclaw.daemon.plist');
  }

  console.log('\n✅ Uninstall complete.\n');
  rl.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  rl.close();
  process.exit(1);
});
