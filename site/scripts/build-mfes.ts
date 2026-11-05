#!/usr/bin/env node

/**
 * Build all MFE packages, several at a time (FRONTX_BUILD_CONCURRENCY).
 * Called by the build and dev scripts before generate:mfe-manifests.
 */

import {
  buildMfes,
  getMFEPackages,
  noDiscoveredPackagesNotice,
} from './lib/mfe-tools.js';

async function main() {
  const { packages, skippedExamples } = getMFEPackages();

  if (packages.length === 0) {
    console.log(`${noDiscoveredPackagesNotice(skippedExamples)} Skipping MFE build.`);
    return;
  }

  console.log(`Found ${packages.length} MFE package(s):`);
  packages.forEach((mfe) => console.log(`  - ${mfe.name}`));
  console.log();

  await buildMfes(packages);
}

// `buildMfes` already phrases its rejection as a full report (which
// package, which exit code, which command shows the underlying type error), so
// it is printed as-is. Prefixing it would only restate its first line.
// `exitCode` rather than `process.exit`: every build has exited by now, and
// exiting at once could drop buffered output still queued on a piped stdout.
main().catch((err) => {
  console.error(`❌ ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
