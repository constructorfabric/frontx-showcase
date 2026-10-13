// @cpt-algo:cpt-template-site-algo-content-model-wrap-command:p1
// @cpt-dod:cpt-template-site-dod-content-model-page-renderer:p1
/** The widest command line a code block shows before it continues the command on the next line. */
export const COMMAND_WIDTH = 76;

/** The indent of a continuation line, so it reads as part of the command above it. */
const CONTINUATION_INDENT = '  ';

/** The positions of the spaces a shell would split words at: spaces inside quotes or after a backslash belong to a word. */
// @cpt-begin:cpt-template-site-algo-content-model-wrap-command:p1:inst-word-breaks
function wordBreaks(line: string): number[] {
  const breaks: number[] = [];
  let quote: '"' | "'" | undefined;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '\\' && quote !== "'") {
      index += 1;
    } else if (quote) {
      if (char === quote) quote = undefined;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === ' ') {
      breaks.push(index);
    }
  }
  return breaks;
}
// @cpt-end:cpt-template-site-algo-content-model-wrap-command:p1:inst-word-breaks

/**
 * Breaks a long shell command into lines joined by a trailing ` \`, so it reads without sideways scrolling and stays one command when it is pasted into a POSIX shell. A line breaks at the last word boundary that keeps it within the width; a word longer than the width stays whole on its own line. A line that is already short, or has no word boundary outside quotes, comes back unchanged.
 * @param line - one command line
 * @param width - the widest line, continuation marker included
 */
export function wrapCommand(line: string, width: number = COMMAND_WIDTH): string[] {
  const lines: string[] = [];
  let rest = line;
  let prefix = '';
  // The marker ` \` takes two columns at the end of every line but the last.
  // @cpt-begin:cpt-template-site-algo-content-model-wrap-command:p1:inst-while-too-long
  while (prefix.length + rest.length > width) {
    // @cpt-begin:cpt-template-site-algo-content-model-wrap-command:p1:inst-if-no-break
    const breaks = wordBreaks(rest).filter((at) => at > 0);
    if (breaks.length === 0) break;
    // @cpt-end:cpt-template-site-algo-content-model-wrap-command:p1:inst-if-no-break
    // @cpt-begin:cpt-template-site-algo-content-model-wrap-command:p1:inst-pick-break
    const fitting = breaks.filter((at) => prefix.length + at + 2 <= width);
    const at = fitting.length > 0 ? fitting[fitting.length - 1] : breaks[0];
    if (at === undefined) break;
    // @cpt-end:cpt-template-site-algo-content-model-wrap-command:p1:inst-pick-break
    // @cpt-begin:cpt-template-site-algo-content-model-wrap-command:p1:inst-emit-line
    lines.push(`${prefix}${rest.slice(0, at)} \\`);
    rest = rest.slice(at + 1).replace(/^ +/, '');
    prefix = CONTINUATION_INDENT;
    // @cpt-end:cpt-template-site-algo-content-model-wrap-command:p1:inst-emit-line
  }
  // @cpt-end:cpt-template-site-algo-content-model-wrap-command:p1:inst-while-too-long
  // @cpt-begin:cpt-template-site-algo-content-model-wrap-command:p1:inst-return-lines
  lines.push(`${prefix}${rest}`);
  return lines;
  // @cpt-end:cpt-template-site-algo-content-model-wrap-command:p1:inst-return-lines
}

/** Every line of a block of commands, each long one wrapped. @param lines - the commands, one per line */
export function wrapCommands(lines: readonly string[], width: number = COMMAND_WIDTH): string[] {
  // @cpt-begin:cpt-template-site-algo-content-model-wrap-command:p1:inst-wrap-block
  return lines.flatMap((line) => wrapCommand(line, width));
  // @cpt-end:cpt-template-site-algo-content-model-wrap-command:p1:inst-wrap-block
}
