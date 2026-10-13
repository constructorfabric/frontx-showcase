// @vitest-environment node
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { bundleHeadSync } from './generate.ts';
import { renderIndexHtml } from './outputs.ts';
import { MAP, ORIGIN } from './test-support/fixtures.ts';

const SHELL_INDEX = '<!doctype html>\n<html lang="en">\n  <head>\n    <title>FrontX</title>\n  </head>\n  <body><div id="root"></div></body>\n</html>\n';

/** The generated `index.html` with the real head-sync bundle, run by a browser-like DOM at an address. */
async function openAt(address: string): Promise<JSDOM> {
  const html = renderIndexHtml(SHELL_INDEX, MAP, await bundleHeadSync());
  return new JSDOM(html, {
    url: `${ORIGIN}${address}`,
    runScripts: 'dangerously',
    // Every browser has these; jsdom's window does not, and the routing package's grammar codec uses them.
    beforeParse(window) {
      Object.assign(window, { TextEncoder, TextDecoder });
    },
  });
}

describe('the bundled head-sync in the generated index.html', () => {
  it('applies the page of the address it is opened at', async () => {
    const dom = await openAt('/?screen=catalogue;route=components/button');
    const doc = dom.window.document;
    expect(doc.title).toBe('Button - FrontX');
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${ORIGIN}/?screen=catalogue;route=components/button`);
    expect(doc.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    dom.window.close();
  });

  it('follows a navigation through the history API the framework router writes with', async () => {
    const dom = await openAt('/?screen=home');
    expect(dom.window.document.title).toBe('FrontX');
    dom.window.history.pushState(null, '', '/?screen=catalogue;route=foundations/typography');
    // A pushState from outside the navigation substrate is not observed; what the substrate itself observes is a popstate.
    dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'));
    expect(dom.window.document.title).toBe('Typography - FrontX');
    dom.window.close();
  });
}, 30000);
