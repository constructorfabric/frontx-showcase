/**
 * Command line of site-meta: `node src/cli.ts generate` (after the project's build) and `node src/cli.ts check`, with the options `args.ts` reads.
 */
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './args.ts';
import { check, generate } from './generate.ts';

/** The project this package sits in: `src-app/verify_packages/site-meta/src/` is four levels below it. */
// @cpt-begin:cpt-template-site-meta-flow-generate-and-check-command-line:p2:inst-default-project
const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
// @cpt-end:cpt-template-site-meta-flow-generate-and-check-command-line:p2:inst-default-project

// @cpt-flow:cpt-template-site-meta-flow-generate-and-check-command-line:p2
// @cpt-dod:cpt-template-site-meta-dod-generate-and-check-command-line:p2
async function main(argv: readonly string[]): Promise<number> {
  // @cpt-begin:cpt-template-site-meta-flow-generate-and-check-command-line:p2:inst-if-usage-error
  let parsed;
  try {
    parsed = parseArgs(argv, process.cwd(), PROJECT);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 2;
  }
  // @cpt-end:cpt-template-site-meta-flow-generate-and-check-command-line:p2:inst-if-usage-error
  // @cpt-begin:cpt-template-site-meta-flow-generate-and-check-command-line:p2:inst-if-generate
  const { command, paths, rasters } = parsed;
  const shown = (file: string) => path.relative(process.cwd(), path.join(paths.project, file)) || '.';
  if (command === 'generate') {
    const written = await generate({ paths, rasters }, process.env);
    console.log(`seo:generate: wrote ${written.map(shown).join(', ')}`);
    return 0;
  }
  // @cpt-end:cpt-template-site-meta-flow-generate-and-check-command-line:p2:inst-if-generate
  // @cpt-begin:cpt-template-site-meta-flow-generate-and-check-command-line:p2:inst-if-check-fails
  const { errors, compared } = await check({ paths, rasters });
  if (errors.length > 0) {
    for (const error of errors) console.error(`seo:check: ${error}`);
    return 1;
  }
  // @cpt-end:cpt-template-site-meta-flow-generate-and-check-command-line:p2:inst-if-check-fails
  // @cpt-begin:cpt-template-site-meta-flow-generate-and-check-command-line:p2:inst-report-check
  const dist = shown('dist');
  console.log(compared ? `seo:check: metadata rules hold; ${dist} outputs are in sync with the sources` : `seo:check: metadata rules hold; ${dist} has no generated outputs to compare (run the build first)`);
  return 0;
  // @cpt-end:cpt-template-site-meta-flow-generate-and-check-command-line:p2:inst-report-check
}

// @cpt-begin:cpt-template-site-meta-flow-generate-and-check-command-line:p2:inst-exit-code
main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
);
// @cpt-end:cpt-template-site-meta-flow-generate-and-check-command-line:p2:inst-exit-code
