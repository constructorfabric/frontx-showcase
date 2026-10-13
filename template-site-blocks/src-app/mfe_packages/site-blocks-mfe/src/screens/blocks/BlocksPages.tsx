import { createElement } from 'react';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@gears-frontx/ui-kit';
import { Heading, Link, VisuallyHidden } from '@gears-frontx/kit-candidates';
import { DocsFrame } from '@gears-frontx/site-blocks/DocsFrame';
import { SectionHeading } from '@gears-frontx/site-blocks/SectionHeading';
import { showcaseEntries, type ShowcaseEntry, type ShowcaseGroup } from '@gears-frontx/site-blocks/showcase';
import { Link as RouterLink, useParams } from '@gears-frontx/routing-tanstack';
import { useBridge } from '../../shared/ScreenFrame';
import { useScreenTranslations } from '../../shared/useScreenTranslations';

// Hoisted to module level: a new map per render would reload the translations on every render.
const languageModules = import.meta.glob('./i18n/*.json') as Record<string, () => Promise<{ default: Record<string, string> }>>;

const GROUPS: readonly ShowcaseGroup[] = ['section', 'docs'];

function useBlocksText() {
  return useScreenTranslations(languageModules, useBridge());
}

/**
 * The showcase entry a route slug names, or `undefined`.
 * @param slug - the `$block` segment of the route
 * @param entries - the showcase entries to look in
 */
// @cpt-begin:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-find-block
export function findBlock(slug: string, entries: readonly ShowcaseEntry[] = showcaseEntries): ShowcaseEntry | undefined {
  return entries.find((entry) => entry.slug === slug);
}
// @cpt-end:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-find-block

// @cpt-dod:cpt-template-site-blocks-dod-blocks-showcase-screen:p1
// @cpt-flow:cpt-template-site-blocks-flow-blocks-showcase-open:p1
/** `/`: every block with a fixture, listed by group, each linking to its own route. */
export function BlocksIndex() {
  // @cpt-begin:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-wait-strings
  const { t, loading } = useBlocksText();
  if (loading) return null;
  // @cpt-end:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-wait-strings
  // @cpt-begin:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-render-index
  return (
    <DocsFrame intro={{ title: t('index_title'), lead: t('index_lead') }}>
      {GROUPS.map((group) => {
        const entries = showcaseEntries.filter((entry) => entry.group === group);
        if (entries.length === 0) return null;
        return (
          <section key={group} aria-labelledby={`blocks-group-${group}`}>
            <SectionHeading id={`blocks-group-${group}`} title={t(`group_${group}`)} />
            <ItemGroup>
              {entries.map((entry) => (
                <Item key={entry.slug} role="listitem" variant="outline">
                  <ItemContent>
                    <ItemTitle>
                      <Link render={<RouterLink to="/$block" params={{ block: entry.slug }} />} data-testid={`block-link-${entry.slug}`}>
                        {entry.title}
                      </Link>
                    </ItemTitle>
                    <ItemDescription>{entry.summary}</ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </section>
        );
      })}
    </DocsFrame>
  );
  // @cpt-end:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-render-index
}

/**
 * `/$block`: one block's fixture. A page frame renders as it is, with its own title; a full-bleed block runs edge to edge under a visually hidden page title; any other block sits inside the page column, under its name and summary as the page intro.
 */
export function BlockPage() {
  const { block } = useParams({ strict: false }) as { block?: string };
  // @cpt-begin:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-render-block
  const entry = findBlock(block ?? '');
  if (!entry) return <BlocksNotFound />;
  const { Fixture } = entry;
  if (!entry.ownsPageTitle && !entry.fullBleed) {
    return (
      <div data-testid={`block-${entry.slug}`}>
        <DocsFrame intro={{ title: entry.title, lead: entry.summary }}>
          <Fixture />
        </DocsFrame>
      </div>
    );
  }
  return (
    <div data-testid={`block-${entry.slug}`}>
      {entry.ownsPageTitle ? null : (
        <VisuallyHidden>
          <Heading render={createElement('h1')}>{entry.title}</Heading>
        </VisuallyHidden>
      )}
      <Fixture />
    </div>
  );
  // @cpt-end:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-render-block
}

/** Any other path inside the screen, and a block route that names no block. */
export function BlocksNotFound() {
  // @cpt-begin:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-wait-strings
  const { t, loading } = useBlocksText();
  if (loading) return null;
  // @cpt-end:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-wait-strings
  // @cpt-begin:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-render-not-found
  return (
    <DocsFrame
      intro={{
        title: t('not_found_title'),
        lead: t('not_found_lead'),
        back: <Link render={<RouterLink to="/" />}>{t('not_found_link')}</Link>,
      }}
    >
      {null}
    </DocsFrame>
  );
  // @cpt-end:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-render-not-found
}
