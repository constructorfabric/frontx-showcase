import { describe, expect, it } from 'vitest';
import { documentHref, taskTwinPath, twinPath } from '@site-shared/content/twins';

describe('documentHref', () => {
  it('writes the published plain-text twins relative to the shell document', () => {
    expect(documentHref(twinPath('docs', '/'))).toBe('./docs/index.md');
    expect(new URL(documentHref(twinPath('docs', '/get-started')), 'https://example.invalid/frontx/?screen=docs').href).toBe('https://example.invalid/frontx/docs/get-started.md');
    expect(new URL(documentHref(taskTwinPath('docs', '/first-change', 'agent-task')), 'https://example.invalid/frontx/').href).toBe('https://example.invalid/frontx/docs/first-change/agent-task.md');
  });

  it("resolves a twin link inside a screen's shadow root against the shell document", () => {
    const base = document.createElement('base');
    base.href = 'https://example.invalid/frontx/';
    document.head.append(base);
    const host = document.createElement('div');
    document.body.append(host);
    try {
      const anchor = document.createElement('a');
      anchor.setAttribute('href', documentHref(twinPath('docs', '/get-started')));
      host.attachShadow({ mode: 'open' }).append(anchor);
      expect(anchor.href).toBe('https://example.invalid/frontx/docs/get-started.md');
    } finally {
      host.remove();
      base.remove();
    }
  });

  it('refuses a path that is not site-root', () => {
    expect(() => documentHref('docs/index.md')).toThrow(/site-root path/);
  });
});
