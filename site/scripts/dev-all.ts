#!/usr/bin/env node

/**
 * Dynamic dev:all orchestrator
 *
 * Scans src-app/mfe_packages/ for MFE packages and automatically starts
 * all found packages in parallel with the main app.
 *
 * Port discovery: reads each package's package.json preview (or dev) script
 * for a --port NNNN argument. No separate registry file required.
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  buildMfesSequentially,
  getMFEPackages,
  noDiscoveredPackagesNotice,
  type MfeInfo,
} from './lib/mfe-tools.js';

// Determine main app command based on available scripts
function getMainAppCommand(): string {
  const rootPkgPath = join(process.cwd(), 'package.json');
  try {
    const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf-8')) as {
      scripts?: Record<string, string>;
    };
    if (rootPkg.scripts?.['generate:colors']) {
      return 'npm run generate:colors && vite';
    }
  } catch {
    // ignore - fall through to default
  }
  return 'vite';
}

// Build preview-only commands (no build step - MFEs are pre-built)
// @cpt-flow:cpt-site-flow-dev-run-start:p3
function buildPreviewCommands(mfes: MfeInfo[]): string[] {
  // @cpt-begin:cpt-site-flow-dev-run-start:p3:inst-compose-commands
  const commands: string[] = [];

  // Add main app
  commands.push(getMainAppCommand());

  // MFE preview only (build already done in the sequential step). `--strictPort`
  // makes a busy port fail the run naming it: the generated manifests point at
  // each package's declared port, and a preview Vite moved to another port
  // would leave its screens unreachable without any error.
  for (const mfe of mfes) {
    commands.push(`cd src-app/mfe_packages/${mfe.name} && npm run preview -- --strictPort`);
  }

  return commands;
  // @cpt-end:cpt-site-flow-dev-run-start:p3:inst-compose-commands
}

// Run manifest generation after MFE builds
function generateManifests(): Promise<void> {
  // @cpt-begin:cpt-site-flow-dev-run-start:p3:inst-generate-manifests
  return new Promise((resolve, reject) => {
    console.log('📋 Generating MFE manifests...\n');

    const proc = spawn('/bin/sh', ['-c', 'npm run generate:mfe-manifests'], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Manifest generation failed with exit code ${code}`));
      }
    });
  });
  // @cpt-end:cpt-site-flow-dev-run-start:p3:inst-generate-manifests
}

// Main execution
// @cpt-dod:cpt-site-dod-dev-run-strict-ports:p3
async function main() {
  console.log('🚀 Starting dev:all...\n');

  // @cpt-begin:cpt-site-flow-dev-run-start:p3:inst-discover
  const { packages, skippedExamples } = getMFEPackages();

  if (packages.length === 0) {
    console.log(noDiscoveredPackagesNotice(skippedExamples));
    console.log('Starting main app only...\n');
  } else {
    console.log(`✅ Found ${packages.length} MFE package(s):`);
    packages.forEach((mfe, idx) => {
      console.log(`  [${idx}] ${mfe.name} (port ${mfe.port})`);
    });
    console.log();
  }
  // @cpt-end:cpt-site-flow-dev-run-start:p3:inst-discover

  // Step 1: Build all MFEs (produces dist/ with mf-manifest.json)
  // @cpt-begin:cpt-site-flow-dev-run-start:p3:inst-build-packages
  await buildMfesSequentially(packages);
  // @cpt-end:cpt-site-flow-dev-run-start:p3:inst-build-packages

  // Step 2: Generate manifests (reads dist/mf-manifest.json, produces generated-mfe-manifests.ts).
  // This child is also where the skipped-examples notice is printed, once per run.
  // @cpt-begin:cpt-site-flow-dev-run-start:p3:inst-generate-manifests
  await generateManifests();
  // @cpt-end:cpt-site-flow-dev-run-start:p3:inst-generate-manifests

  // Step 3: Start host + MFE preview servers concurrently
  // @cpt-begin:cpt-site-flow-dev-run-start:p3:inst-compose-commands
  const commands = buildPreviewCommands(packages);
  // @cpt-end:cpt-site-flow-dev-run-start:p3:inst-compose-commands

  // @cpt-begin:cpt-site-flow-dev-run-start:p3:inst-run-concurrently
  // Quote each command properly for concurrently
  const quotedCommands = commands.map((cmd) => `"${cmd.replace(/"/g, '\\"')}"`);

  // Build concurrently command
  const concurrentlyCmd = ['concurrently', '--kill-others', ...quotedCommands];

  console.log(`📝 Running: ${concurrentlyCmd.join(' ')}\n`);

  // Execute concurrently
  const proc = spawn('npx', concurrentlyCmd, {
    stdio: 'inherit',
    shell: true,
  });

  proc.on('error', (error) => {
    console.error(`❌ Failed to start dev:all: ${error.message}`);
    process.exit(1);
  });

  proc.on('exit', (code) => {
    process.exit(code || 0);
  });
  // @cpt-end:cpt-site-flow-dev-run-start:p3:inst-run-concurrently
}

// The rejection is already phrased as a full report - `buildMfesSequentially`
// names the package, how it failed and the command that shows the real error -
// so it is printed as its message rather than as a value. `console.error` with
// an Error object prints a stack trace, which buries a multi-line hint in frames
// that point at this script instead of at the package to fix.
// @cpt-begin:cpt-site-flow-dev-run-start:p3:inst-report-failure
main().catch((err) => {
  console.error(`❌ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
// @cpt-end:cpt-site-flow-dev-run-start:p3:inst-report-failure
