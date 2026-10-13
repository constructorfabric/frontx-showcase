import { Suspense, useEffect, useState, type ComponentType } from 'react';
import { ArrowLeftIcon, ArrowUpRightIcon, SearchIcon } from 'lucide-react';
import { Link, useParams } from '@gears-frontx/routing-tanstack';
import { Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@gears-frontx/ui-kit';
import { Text } from '@gears-frontx/kit-candidates';
import { CodeSample } from '../../blocks/CodeSample';
import { ComponentGuide, GuideColumn } from '../../blocks/ComponentGuide';
import { FoundationStage } from '../../blocks/FoundationStage';
import { IconLink } from '../../blocks/IconLink';
import { IndexIntro } from '../../blocks/IndexIntro';
import { ListCard, ListCardEntry } from '../../blocks/ListCard';
import { ListCardGrid } from '../../blocks/ListCardGrid';
import { PageFrame } from '../../blocks/PageFrame';
import { PageHeader, type PageTrail } from '../../blocks/PageHeader';
import { PagePlaceholder } from '../../blocks/PagePlaceholder';
import { PreviewStage } from '../../blocks/PreviewStage';
import { FAMILIES, FAMILY_ICON, componentsOf, findComponent, findFoundation, type ComponentEntry } from '../../catalog';
import { ExampleErrorBoundary } from '../../frame/ExampleErrorBoundary';
import { KIT_VERSION, typeDefinitionsUrl } from '../../frame/kitVersion';
import { useCatalogueSearch } from './CatalogueSearch';
import { useCatalogueText } from './CatalogueText';

/** Fills `{name}` placeholders of a string. */
function fill(text: string, values: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
}

/** The trail above every page: the catalogue's root, then the current page. */
function useTrail(current: string): PageTrail {
  const { t } = useCatalogueText();
  return { label: t('breadcrumb_label'), root: t('title'), rootRender: <Link to="/" />, current };
}

/** `/`: the catalogue index: the page header, the intro with the search, and the components grouped by family, each family a list card. */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-pages:p1
export function CatalogueIndex() {
  const { t, loading } = useCatalogueText();
  const { search, setSearch, query } = useCatalogueSearch();
  const trail = useTrail(t('all_components'));
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-wait-for-strings
  if (loading) return <PagePlaceholder />;
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-wait-for-strings
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-filter-components
  const matches = (entry: ComponentEntry) => query === '' || t(entry.labelKey).toLowerCase().includes(query) || t(`description.${entry.slug}`).toLowerCase().includes(query);
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-filter-components
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-group-families
  const families = FAMILIES.map((family) => ({ family, entries: componentsOf(family).filter(matches) })).filter((group) => group.entries.length > 0);
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-group-families
  return (
    <PageFrame>
      {/* @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-render-index-header */}
      <PageHeader trail={trail} title={t('title')} />
      <IndexIntro
        intro={t('intro')}
        search={
          <Input
            type="search"
            icon={<SearchIcon aria-hidden="true" />}
            aria-label={t('search_label')}
            placeholder={t('search_placeholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            data-testid="index-search"
          />
        }
      />
      {/* @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-render-index-header */}
      {/* @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-render-families */}
      {families.length === 0 ? (
        <Text variant="meta" tone="muted">
          {t('no_results')}
        </Text>
      ) : (
        <ListCardGrid label={t('families_title')}>
          {families.map(({ family, entries }) => (
            <ListCard key={family} title={t(`family.${family}`)} icon={FAMILY_ICON[family]} count={entries.length} testId={`family-${family}`}>
              {entries.map((entry) => (
                <ListCardEntry key={entry.path} label={t(entry.labelKey)} meta={t('entry_meta')} render={<Link to={entry.path} />} />
              ))}
            </ListCard>
          ))}
        </ListCardGrid>
      )}
      {/* @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-render-families */}
    </PageFrame>
  );
}

type SourceState = { status: 'loading' } | { status: 'loaded'; text: string } | { status: 'failed' };

/** The example file's source, loaded once per page; a load that fails says so instead of loading forever. */
// @cpt-state:cpt-template-catalogue-state-catalogue-screen-example-source:p2
function useExampleSource(entry: ComponentEntry): SourceState {
  const [state, setState] = useState<SourceState>({ status: 'loading' });
  useEffect(() => {
    let active = true;
    entry.loadSource().then(
      // @cpt-begin:cpt-template-catalogue-state-catalogue-screen-example-source:p2:inst-source-loaded
      (text) => active && setState({ status: 'loaded', text }),
      // @cpt-end:cpt-template-catalogue-state-catalogue-screen-example-source:p2:inst-source-loaded
      // @cpt-begin:cpt-template-catalogue-state-catalogue-screen-example-source:p2:inst-source-failed
      (error: unknown) => {
        console.error(`[catalogue] the source of ${entry.slug} did not load`, error);
        if (active) setState({ status: 'failed' });
      }
      // @cpt-end:cpt-template-catalogue-state-catalogue-screen-example-source:p2:inst-source-failed
    );
    return () => {
      active = false;
    };
  }, [entry]);
  return state;
}

/** The Code tab: the example file's source. */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1
function ExampleSource({ entry, source }: { entry: ComponentEntry; source: SourceState }) {
  const { t } = useCatalogueText();
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-render-code
  if (source.status === 'failed')
    return (
      <Text variant="meta" tone="muted" role="alert">
        {t('source_failed')}
      </Text>
    );
  if (source.status === 'loading') return <PagePlaceholder label={t('source_loading')} />;
  return <CodeSample title={`examples/${entry.slug}.tsx`} code={source.text} copyLabel={t('copy')} copiedLabel={t('copied')} />;
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-render-code
}

/** The two columns under the example: "Use in your app" (the install line for the installed kit version, where the theme and the imports come from, the example file to download) and "Component contract" (the type definitions the installed version publishes). */
function Guide({ entry, source }: { entry: ComponentEntry; source: SourceState }) {
  const { t } = useCatalogueText();
  const arrow = <ArrowUpRightIcon aria-hidden="true" size={14} />;
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-render-guide
  return (
    <ComponentGuide>
      <GuideColumn
        id="catalogue-use"
        title={t('use.title')}
        code={<CodeSample title={t('use.install')} code={`npm install @gears-frontx/ui-kit@${KIT_VERSION}`} copyLabel={t('copy')} copiedLabel={t('copied')} />}
        note={t('use.note')}
        link={
          source.status === 'loaded' ? (
            <IconLink href={`data:text/plain;charset=utf-8,${encodeURIComponent(source.text)}`} download={`${entry.slug}.tsx`} testId="download-example" trailingIcon={arrow}>
              {t('use.download')}
            </IconLink>
          ) : undefined
        }
      />
      <GuideColumn
        id="catalogue-contract"
        title={t('contract.title')}
        note={t('contract.note')}
        link={
          <IconLink href={typeDefinitionsUrl(entry.slug)} rel="noopener" testId="type-definitions" trailingIcon={arrow}>
            {fill(t('use.types'), { version: KIT_VERSION })}
          </IconLink>
        }
      />
    </ComponentGuide>
  );
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-render-guide
}

/** `/components/$slug`: one component: the way back to the index, its title with its family, its description, the example in a Preview tab and its source in a Code tab, and how to use it. */
export function ComponentPage() {
  const { slug } = useParams({ strict: false }) as { slug?: string };
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-find-component
  const entry = slug ? findComponent(slug) : undefined;
  if (!entry) return <CatalogueNotFound />;
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-find-component
  return <ComponentView key={entry.slug} entry={entry} />;
}

function ComponentView({ entry }: { entry: ComponentEntry }) {
  const { t, loading } = useCatalogueText();
  const trail = useTrail(t(entry.labelKey));
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-load-source
  const source = useExampleSource(entry);
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-load-source
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-wait-for-strings
  if (loading) return <PagePlaceholder />;
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-wait-for-strings
  const Example: ComponentType = entry.Component;
  return (
    <PageFrame>
      {/* @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-render-component-header */}
      <PageHeader
        trail={trail}
        back={
          <IconLink variant="muted" render={<Link to="/" />} icon={<ArrowLeftIcon aria-hidden="true" size={15} />}>
            {t('back')}
          </IconLink>
        }
        title={t(entry.labelKey)}
        aside={
          entry.family ? (
            <Text variant="meta" tone="muted" render={<span />}>
              {t(`family.${entry.family}`)}
            </Text>
          ) : undefined
        }
        lead={t(`description.${entry.slug}`)}
      />
      {/* @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-render-component-header */}
      <Tabs defaultValue="preview">
        <TabsList aria-label={t('tabs_label')}>
          <TabsTrigger value="preview">{t('tab.preview')}</TabsTrigger>
          <TabsTrigger value="code">{t('tab.code')}</TabsTrigger>
        </TabsList>
        {/* @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-render-preview */}
        <TabsContent value="preview">
          <PreviewStage>
            <ExampleErrorBoundary key={entry.slug} label={t('example_crashed')}>
              <Suspense fallback={<PagePlaceholder label={t('loading')} />}>
                <Example />
              </Suspense>
            </ExampleErrorBoundary>
          </PreviewStage>
        </TabsContent>
        {/* @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-render-preview */}
        {/* @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-render-code */}
        <TabsContent value="code">
          <ExampleSource entry={entry} source={source} />
        </TabsContent>
        {/* @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-render-code */}
      </Tabs>
      {/* @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-render-guide */}
      <Guide entry={entry} source={source} />
      {/* @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-render-guide */}
    </PageFrame>
  );
}

/** `/foundations/$slug`: one design-token foundations page, in the kit's Card. */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-screen-browse-foundation:p1
export function FoundationPage() {
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const { t, loading } = useCatalogueText();
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-foundation:p1:inst-find-foundation
  const entry = slug ? findFoundation(slug) : undefined;
  const trail = useTrail(entry ? t(entry.labelKey) : '');
  if (!entry) return <CatalogueNotFound />;
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-foundation:p1:inst-find-foundation
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-foundation:p1:inst-wait-for-strings
  if (loading) return <PagePlaceholder />;
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-foundation:p1:inst-wait-for-strings
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-foundation:p1:inst-render-foundation
  const Page = entry.Component;
  return (
    <PageFrame>
      <PageHeader trail={trail} title={t(entry.labelKey)} />
      <FoundationStage>
        <ExampleErrorBoundary key={entry.slug} label={t('example_crashed')}>
          <Page />
        </ExampleErrorBoundary>
      </FoundationStage>
    </PageFrame>
  );
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-foundation:p1:inst-render-foundation
}

/** Any path that names no page of the catalogue. */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-screen-navigate:p1
export function CatalogueNotFound() {
  const { t, loading } = useCatalogueText();
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-not-found
  if (loading) return null;
  return (
    <PageFrame testId="catalogue-not-found">
      <PageHeader title={t('not_found_title')} lead={t('not_found_body')} />
      <IconLink render={<Link to="/" />}>{t('not_found_link')}</IconLink>
    </PageFrame>
  );
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-not-found
}
