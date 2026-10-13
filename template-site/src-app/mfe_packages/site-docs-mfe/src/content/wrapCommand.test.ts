import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { wrapCommand } from '@site-shared/content/wrapCommand';

/** The words a POSIX shell reads from a command text, one per argument. */
function shellWords(command: string): string[] {
  const out = execFileSync('/bin/sh', ['-c', `set -- ${command}\nprintf '%s\\0' "$@"`], { encoding: 'utf8' });
  return out.split('\0').slice(0, -1);
}

const INSTALL = 'npm exec --yes --package=@gears-frontx/cli@0.3.0-alpha.7 -- frontx install github:constructorfabric/gears-frontx-templates//template-shell@3b6cddb2a700ae76bc5e1991204e127de566d597';

describe('wrapCommand', () => {
  it('keeps a long command one command for the shell, every line within the width but a lone long word', () => {
    const lines = wrapCommand(INSTALL, 76);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.slice(0, -1).every((line) => line.endsWith(' \\') && line.length <= 76)).toBe(true);
    expect(shellWords(lines.join('\n'))).toEqual(shellWords(INSTALL));
  });

  it('never breaks inside quotes and leaves a short line alone', () => {
    const quoted = 'export FRONTX_INVENTORY_ROOT="$PWD/a directory with spaces that runs on and on past the width"';
    const wrapped = wrapCommand(quoted, 40);
    expect(wrapped.some((line) => line.includes('"$PWD/a directory with spaces that runs on and on past the width"'))).toBe(true);
    expect(shellWords(wrapped.join('\n'))).toEqual(shellWords(quoted));
    expect(wrapCommand('npm install', 76)).toEqual(['npm install']);
  });
});
