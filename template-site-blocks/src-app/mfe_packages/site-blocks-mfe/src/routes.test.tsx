import './test-support/jsdomBrowserApis';
import { render, screen } from '@testing-library/react';
import { FRONTX_SHARED_PROPERTY_LANGUAGE, FRONTX_SHARED_PROPERTY_THEME } from '@gears-frontx/react';
import { resolveNavigationHistory } from '@gears-frontx/routing';
import { adaptProviderHistory, EngineProvider } from '@gears-frontx/routing-tanstack';
import { showcaseEntries } from '@gears-frontx/site-blocks/showcase';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { afterEach, describe, expect, it } from 'vitest';
import en from './screens/blocks/i18n/en.json';
import { blocksRouteTree } from './routes';
import { findBlock } from './screens/blocks/BlocksPages';
import { ScreenFrame } from './shared/ScreenFrame';

/** Renders the route tree at a path, over the page address (the standalone mode of the screen's router). */
function renderBlocksAt(pathname: string) {
  window.history.replaceState(null, '', pathname);
  const { bridge } = createMfeBridgeFixture({
    extDomainId: 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1',
    extensionId: 'ext.blocks',
    initialProperties: { [FRONTX_SHARED_PROPERTY_LANGUAGE]: 'en', [FRONTX_SHARED_PROPERTY_THEME]: 'light' },
  });
  return render(
    <ScreenFrame bridge={bridge}>
      <EngineProvider routeTree={blocksRouteTree} history={adaptProviderHistory(resolveNavigationHistory(), undefined)} />
    </ScreenFrame>
  );
}

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('findBlock', () => {
  it('finds an entry by its slug and nothing for an unknown slug', () => {
    expect(findBlock('section-frame')?.title).toBe('Section frame');
    expect(findBlock('no-such-block')).toBeUndefined();
  });
});

describe('blocksRouteTree', () => {
  it('lists every block of the package by group at the screen root, each linking to its route', async () => {
    renderBlocksAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: en.index_title })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: en.group_docs })).toBeTruthy();
    for (const entry of showcaseEntries) {
      expect(screen.getByTestId(`block-link-${entry.slug}`).getAttribute('href')).toBe(`/${entry.slug}`);
    }
  });

  it('renders one block under a single level-one heading: a hidden title for a block, the frame\'s own for a page frame', async () => {
    const first = renderBlocksAt('/section-frame');
    await screen.findByRole('region', { name: /One shell/ });
    expect(screen.getAllByRole('heading', { level: 1 }).map((heading) => heading.textContent)).toEqual(['Section frame']);
    expect(screen.getByRole('region', { name: /One shell/ })).toBeTruthy();

    first.unmount();
    renderBlocksAt('/docs-frame');
    await screen.findByRole('heading', { level: 1, name: 'Build with FrontX.' });
    expect(screen.getAllByRole('heading', { level: 1 }).map((heading) => heading.textContent)).toContain('Build with FrontX.');
  });

  it('renders a block that is not full-bleed inside the page column, under its visible title and summary, and a full-bleed block edge to edge', async () => {
    const first = renderBlocksAt('/path-cards');
    const entry = findBlock('path-cards')!;
    const title = await screen.findByRole('heading', { level: 1, name: entry.title });
    const column = title.closest('article');
    expect(column).toBeTruthy();
    expect(column!.textContent).toContain(entry.summary);
    expect(column!.querySelector('ul')).toBeTruthy();

    first.unmount();
    renderBlocksAt('/hero');
    await screen.findByRole('heading', { level: 1, name: /Build complex apps/ });
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByTestId('block-hero').querySelector('article')).toBeNull();
  });

  it('renders every block route with an outline that never skips a heading level', async () => {
    const skips: string[] = [];
    for (const entry of showcaseEntries) {
      const view = renderBlocksAt(`/${entry.slug}`);
      await screen.findAllByRole('heading', { level: 1 });
      let deepest = 0;
      for (const heading of Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))) {
        const level = Number(heading.tagName.slice(1));
        if (level > deepest + 1) skips.push(`${entry.slug}: h${deepest} then h${level}`);
        deepest = level;
      }
      view.unmount();
    }
    expect(skips).toEqual([]);
  });

  it("renders the screen's not-found page for an unknown block and any other path, linking back to the root", async () => {
    const first = renderBlocksAt('/no-such-block');
    expect(await screen.findByRole('heading', { level: 1, name: en.not_found_title })).toBeTruthy();
    expect(screen.getByRole('link', { name: en.not_found_link }).getAttribute('href')).toBe('/');
    first.unmount();
    renderBlocksAt('/a/b');
    expect(await screen.findByRole('heading', { level: 1, name: en.not_found_title })).toBeTruthy();
  });
});
