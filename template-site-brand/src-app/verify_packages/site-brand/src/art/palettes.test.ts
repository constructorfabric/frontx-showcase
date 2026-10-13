import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { checkScript, checkStylesheet } from '../test-support/art-palettes';

const ART = path.dirname(fileURLToPath(import.meta.url));
const files = fs.readdirSync(ART).filter((name) => !/\.test\./.test(name));

describe('art palettes (ADR 0002)', () => {
  it('keeps every colour literal of an art stylesheet in the palettes at its top, and every dark palette switches every colour', () => {
    const sheets = files.filter((name) => name.endsWith('.module.css'));
    expect(sheets.length).toBeGreaterThanOrEqual(8);
    const findings = sheets.flatMap((name) => checkStylesheet(name, fs.readFileSync(path.join(ART, name), 'utf8')));
    expect(findings).toEqual([]);
  });

  it('writes no colour literal in an art script', () => {
    const scripts = files.filter((name) => /\.tsx?$/.test(name));
    const findings = scripts.flatMap((name) => checkScript(name, fs.readFileSync(path.join(ART, name), 'utf8')));
    expect(findings).toEqual([]);
  });

  it('fails a colour outside the palette, a dark palette that misses a colour, a stylesheet with no palette and a literal in a script', () => {
    const outside = checkStylesheet('a.css', '.a { --a-ink: #111111; }\n.a { color: var(--a-ink); }\n.b { background: #ffffff; }');
    expect(outside.map((finding) => finding.message)).toEqual(['colour literal outside the palette: .b { background: #ffffff }']);
    const partial = checkStylesheet('b.css', ".a { --a-ink: #111111; --a-wash: rgb(0 0 0 / 0.1); }\n:where([data-theme='dark']) .a { --a-ink: #eeeeee; }\n.a { color: var(--a-ink); }");
    expect(partial.map((finding) => finding.message)).toEqual([`palette ":where([data-theme='dark']) .a" does not switch --a-wash`]);
    expect(checkStylesheet('c.css', '.a { color: red; }').map((finding) => finding.message)).toEqual(['no palette block at the top of the stylesheet']);
    expect(checkScript('d.tsx', 'const x = <stop stopColor="#ffffff" />;')).toHaveLength(1);
    expect(checkScript('e.tsx', '// a comment naming #ffffff\nconst y = 1;')).toEqual([]);
  });
});
