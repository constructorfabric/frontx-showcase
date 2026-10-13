// @vitest-environment node
import fs from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { devTwin } from './dev.ts';
import { makeProject } from './test-support/project.ts';

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe('devTwin', () => {
  it('renders the twin of an outline page from the current sources, with links on the dev origin, and answers nothing for other paths', () => {
    const paths = makeProject(roots);
    const twin = devTwin(paths, 'http://localhost:5173', '/demo/week.md');
    expect(twin?.screen).toBe('demo');
    expect(twin?.content).toMatch(/^# Week/);
    expect(twin?.content).toContain('Page: http://localhost:5173/?screen=demo;route=week');
    // A browser shows text/plain in the tab; text/markdown or an unknown type makes a click on "Plain-text guide" a download.
    expect(twin?.contentType).toBe('text/plain; charset=utf-8');
    expect(devTwin(paths, 'http://localhost:5173', '/demo/no-such-page.md')).toBeUndefined();
    expect(devTwin(paths, 'http://localhost:5173', '/demo/week')).toBeUndefined();
  });
});
