/**
 * The command line: `generate|check [--project <dir>] [--config <file>] [--rasters <file>]`. Paths resolve against the working directory. The project defaults to the one this package sits in (`src-app/verify_packages/site-meta/` of a template-shell project), the config to `site.config.json` in the project, and without `--rasters` no raster record is checked.
 */
import path from 'node:path';
import { sitePaths, type SitePaths } from './site.ts';

// @cpt-begin:cpt-template-site-meta-algo-generate-and-check-parse-args:p2:inst-usage
export const USAGE = 'usage: node src/cli.ts generate|check [--project <dir>] [--config <file>] [--rasters <file>]';

const COMMANDS = ['generate', 'check'] as const;
// @cpt-end:cpt-template-site-meta-algo-generate-and-check-parse-args:p2:inst-usage
export type Command = (typeof COMMANDS)[number];

export interface ParsedArgs {
  readonly command: Command;
  readonly paths: SitePaths;
  readonly rasters?: string;
}

const isCommand = (value: string | undefined): value is Command => COMMANDS.some((command) => command === value);

/**
 * Parses the command line; throws with the usage on anything it does not know.
 * @param argv - the arguments after the script
 * @param cwd - the working directory
 * @param defaultProject - the project this package sits in
 */
// @cpt-algo:cpt-template-site-meta-algo-generate-and-check-parse-args:p2
export function parseArgs(argv: readonly string[], cwd: string, defaultProject: string): ParsedArgs {
  // @cpt-begin:cpt-template-site-meta-algo-generate-and-check-parse-args:p2:inst-if-unknown-command
  const [command, ...rest] = argv;
  if (!isCommand(command)) throw new Error(USAGE);
  // @cpt-end:cpt-template-site-meta-algo-generate-and-check-parse-args:p2:inst-if-unknown-command
  // @cpt-begin:cpt-template-site-meta-algo-generate-and-check-parse-args:p2:inst-foreach-option
  const values = new Map<string, string>();
  for (let index = 0; index < rest.length; index += 2) {
    const option = rest[index] ?? '';
    const value = rest[index + 1];
    if (!['--project', '--config', '--rasters'].includes(option)) throw new Error(`unknown option ${option}; ${USAGE}`);
    if (value === undefined || value.startsWith('--')) throw new Error(`${option} needs a value; ${USAGE}`);
    values.set(option, path.resolve(cwd, value));
  }
  // @cpt-end:cpt-template-site-meta-algo-generate-and-check-parse-args:p2:inst-foreach-option
  // @cpt-begin:cpt-template-site-meta-algo-generate-and-check-parse-args:p2:inst-take-project
  const project = values.get('--project') ?? defaultProject;
  const rasters = values.get('--rasters');
  // @cpt-end:cpt-template-site-meta-algo-generate-and-check-parse-args:p2:inst-take-project
  // @cpt-begin:cpt-template-site-meta-algo-generate-and-check-parse-args:p2:inst-return-args
  return { command, paths: sitePaths(project, values.get('--config')), ...(rasters ? { rasters } : {}) };
  // @cpt-end:cpt-template-site-meta-algo-generate-and-check-parse-args:p2:inst-return-args
}
