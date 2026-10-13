/**
 * Command line of site-brand: `node src/check/cli.ts generate` writes src/tokens.css, src/theme.ts and the guideline's token table from src/brand.json; `node src/check/cli.ts check` runs the brand check. Options: `--project <dir>` (default: the project this package sits in), `--kit <theme.css>` (default: the project's installed @gears-frontx/ui-kit), `--config <site.config.json>` (default: the first of `<project>/site.config.json` and `<project>/../site.config.json` that exists), `--scan <dir>` (repeatable; default `<project>/src-app`). Paths resolve against the working directory.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { renderThemeTs, renderTokensCss, renderTokenTable, spliceTable } from './generate.ts';
import { loadBrand, readKit } from './model.ts';
import { runChecks } from './rules.ts';
import { collectSources } from './sources.ts';

/** This package's directory: `src/check/` is two levels below it. */
const PACKAGE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BUNDLE_GUIDELINE = '.frontx/ai/@gears-frontx/frontx-template-site-brand/guidelines/brand.md';

interface Options {
  readonly command: 'generate' | 'check';
  readonly project: string;
  readonly kit?: string;
  readonly config?: string;
  readonly scan: readonly string[];
}

// @cpt-flow:cpt-template-site-brand-flow-brand-check-run:p1
// @cpt-dod:cpt-template-site-brand-dod-brand-check-rules:p1
function parseArgs(argv: readonly string[]): Options {
  // @cpt-begin:cpt-template-site-brand-flow-brand-check-run:p1:inst-parse-options
  const [command, ...rest] = argv;
  if (command !== 'generate' && command !== 'check') throw new Error('usage: cli.ts generate|check [--project <dir>] [--kit <theme.css>] [--config <file>] [--scan <dir>]...');
  const values: Record<string, string[]> = {};
  for (let index = 0; index < rest.length; index += 2) {
    const [flag, value] = [rest[index], rest[index + 1]];
    if (!['--project', '--kit', '--config', '--scan'].includes(flag) || value === undefined) throw new Error(`unknown or incomplete option ${flag}`);
    (values[flag] ??= []).push(path.resolve(value));
  }
  const project = values['--project']?.[0] ?? path.resolve(PACKAGE, '..', '..', '..');
  return { command, project, kit: values['--kit']?.[0], config: values['--config']?.[0], scan: values['--scan'] ?? [path.join(project, 'src-app')] };
  // @cpt-end:cpt-template-site-brand-flow-brand-check-run:p1:inst-parse-options
}

function kitPath(options: Options): string {
  // @cpt-begin:cpt-template-site-brand-flow-brand-check-run:p1:inst-locate-kit
  if (options.kit) return options.kit;
  try {
    return createRequire(path.join(options.project, 'package.json')).resolve('@gears-frontx/ui-kit/theme.css');
  } catch {
    throw new Error(`no @gears-frontx/ui-kit installed for ${options.project}; pass --kit <path to theme.css>`);
  }
  // @cpt-end:cpt-template-site-brand-flow-brand-check-run:p1:inst-locate-kit
}

// @cpt-flow:cpt-template-site-brand-flow-brand-source-and-generation-change-value:p1
// @cpt-dod:cpt-template-site-brand-dod-brand-source-and-generation-record:p1
function generate(options: Options): string[] {
  // @cpt-begin:cpt-template-site-brand-flow-brand-source-and-generation-change-value:p1:inst-read-record
  const brand = loadBrand(fs.readFileSync(path.join(PACKAGE, 'src/brand.json'), 'utf8'));
  const kit = readKit(fs.readFileSync(kitPath(options), 'utf8'));
  // @cpt-end:cpt-template-site-brand-flow-brand-source-and-generation-change-value:p1:inst-read-record
  // @cpt-begin:cpt-template-site-brand-flow-brand-source-and-generation-change-value:p1:inst-write-outputs
  const written = [path.join(PACKAGE, 'src/tokens.css'), path.join(PACKAGE, 'src/theme.ts')];
  fs.writeFileSync(written[0], renderTokensCss(brand));
  fs.writeFileSync(written[1], renderThemeTs(brand, kit));
  // @cpt-end:cpt-template-site-brand-flow-brand-source-and-generation-change-value:p1:inst-write-outputs
  // @cpt-begin:cpt-template-site-brand-flow-brand-source-and-generation-change-value:p1:inst-write-table
  const guideline = path.join(options.project, BUNDLE_GUIDELINE);
  if (fs.existsSync(guideline)) {
    fs.writeFileSync(guideline, spliceTable(fs.readFileSync(guideline, 'utf8'), renderTokenTable(brand)));
    written.push(guideline);
  }
  return written;
  // @cpt-end:cpt-template-site-brand-flow-brand-source-and-generation-change-value:p1:inst-write-table
}

function check(options: Options): string[] {
  // @cpt-begin:cpt-template-site-brand-flow-brand-check-run:p1:inst-read-inputs
  const brand = loadBrand(fs.readFileSync(path.join(PACKAGE, 'src/brand.json'), 'utf8'));
  const kit = readKit(fs.readFileSync(kitPath(options), 'utf8'));
  const read = (file: string) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '');
  const guidelineFile = path.join(options.project, BUNDLE_GUIDELINE);
  const guidelineText = fs.existsSync(guidelineFile) ? read(guidelineFile) : undefined;
  const configFile = options.config ?? [path.join(options.project, 'site.config.json'), path.join(options.project, '..', 'site.config.json')].find((file) => fs.existsSync(file));
  const config = configFile ? (JSON.parse(fs.readFileSync(configFile, 'utf8')) as Record<string, unknown>) : undefined;
  const sources = collectSources(options.scan, [PACKAGE], options.project);
  const art = path.join(PACKAGE, 'src/art');
  const artSources = fs.existsSync(art) ? collectSources([art], [], options.project) : [];
  // @cpt-end:cpt-template-site-brand-flow-brand-check-run:p1:inst-read-inputs
  // @cpt-begin:cpt-template-site-brand-flow-brand-check-run:p1:inst-run-rules
  return runChecks({
    brand,
    kit,
    generated: {
      tokensCss: { expected: renderTokensCss(brand), actual: read(path.join(PACKAGE, 'src/tokens.css')) },
      themeTs: { expected: renderThemeTs(brand, kit), actual: read(path.join(PACKAGE, 'src/theme.ts')) },
      guideline: guidelineText === undefined ? undefined : { expected: spliceTable(guidelineText, renderTokenTable(brand)), actual: guidelineText },
    },
    sources,
    artSources,
    config,
  });
  // @cpt-end:cpt-template-site-brand-flow-brand-check-run:p1:inst-run-rules
}

function main(argv: readonly string[]): number {
  let options: Options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 2;
  }
  // @cpt-begin:cpt-template-site-brand-flow-brand-check-run:p1:inst-report
  try {
    if (options.command === 'generate') {
      console.log(`brand:generate: wrote ${generate(options).map((file) => path.relative(process.cwd(), file)).join(', ')}`);
      return 0;
    }
    const errors = check(options);
    for (const error of errors) console.error(`brand:check: ${error}`);
    if (errors.length === 0) console.log('brand:check: the brand record, its generated files and every source agree');
    return errors.length === 0 ? 0 : 1;
  } catch (error) {
    console.error(`brand:${options.command}: ${error instanceof Error ? error.message : error}`);
    return 1;
  }
  // @cpt-end:cpt-template-site-brand-flow-brand-check-run:p1:inst-report
}

process.exitCode = main(process.argv.slice(2));
