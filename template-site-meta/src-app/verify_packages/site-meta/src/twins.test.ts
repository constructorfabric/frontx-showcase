// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildPageMap, type ScreenExtension } from './site.ts';
import { CONFIG, ORIGIN } from './test-support/fixtures.ts';
import { renderTwins, taskTwinPath, twinPath, type ScreenOutline } from './twins.ts';

const describeText = (what: string) => `${what}: a description long enough to hold the fifty character minimum.`;

const EXTENSIONS: ScreenExtension[] = [
  { id: 'ext.home', route: '/home', packageName: 'site-home-mfe', presentation: { label: 'Home', order: 10 }, seo: { title: 'Home', description: describeText('Home') } },
  {
    id: 'ext.templates',
    route: '/templates',
    packageName: 'site-templates-mfe',
    presentation: { label: 'Templates', order: 20 },
    seo: { title: 'Templates', description: describeText('Templates'), routes: { '/template-shell': { title: 'Shell', description: describeText('Shell') } } },
  },
  {
    id: 'ext.docs',
    route: '/docs',
    packageName: 'site-docs-mfe',
    presentation: { label: 'Docs', order: 40 },
    seo: { title: 'Docs', description: describeText('Docs'), routes: { '/get-started': { title: 'Get started', description: describeText('Get started') }, '/first-change': { title: 'First change', description: describeText('First change') } } },
  },
  {
    id: 'ext.catalogue',
    route: '/catalogue',
    packageName: 'catalogue-mfe',
    presentation: { label: 'UI Kit', order: 30 },
    seo: { title: 'UI Kit', description: describeText('UI Kit'), routes: { '/components/button': { title: 'Button', description: describeText('Button') } } },
  },
  { id: 'ext.inbox-mail', route: '/inbox-mail', packageName: 'inbox-mail-mfe', presentation: { label: 'Mail', order: 64 }, seo: { title: 'Mail', description: describeText('Mail') } },
];
const MAP = buildPageMap(CONFIG, ORIGIN, 'screen', EXTENSIONS);

const strings = {
  title: 'Shell',
  lead: 'The host.',
  'files.title': 'Key files',
  'files.main': 'The entry.',
  'example.title': 'See it running',
  'example.lead': 'Screens of this site.',
  'example.open': 'Open example',
  'example.home': 'Home',
  'source.label': 'Source',
  'libs.shellTitle': 'Packages that come with template-shell',
  'libs.shellLead': 'Workspace packages.',
};

const outline: ScreenOutline = {
  screen: 'templates',
  strings,
  vars: { aiKitUrl: 'https://example.invalid/kit' },
  libraries: [{ package: '@gears-frontx/ui-kit', version: '1.0.0', description: 'The kit.', sourceUrl: 'https://example.invalid/tree/abc' }],
  shellPackages: [{ package: '@gears-frontx/react', version: '2.0.0', description: 'React bindings.' }],
  pages: [
    {
      route: '/template-shell',
      title: 't:title',
      lead: 't:lead',
      meta: ['Node.js 25 and npm 10', 'FrontX CLI 1.2.3'],
      entries: [
        {
          type: 'file-explorer',
          id: 'files',
          title: 't:files.title',
          source: { label: 't:source.label', value: '3b6cddb', href: { url: 'https://example.invalid/tree/3b6cddb' } },
          files: [{ path: 'src/main.tsx', text: 't:files.main', lines: 2, contentBase64: Buffer.from('const fence = "```";\nexport {};\n').toString('base64'), url: 'https://example.invalid/blob/main.tsx' }],
          example: { title: 't:example.title', text: 't:example.lead', screens: [{ title: 't:example.home', href: { extension: 'ext.home' } }], open: { label: 't:example.open', href: { extension: 'ext.home' } } },
        },
        { type: 'panels', items: [{ title: 'Agent', text: 'Kit docs.', links: [{ label: 'Docs', href: { url: '{aiKitUrl}' } }] }] },
        { type: 'cta-box', title: 'Make it yours', text: 'Change a screen.', action: { label: 'Start', href: { anchor: 'files' } } },
        { type: 'package-list' },
        { type: 'agent-task', id: 'agent-task', summary: 'Task for your agent', twin: 'Plain-text task', code: { title: 'Task', lines: ['Read {siteOrigin}/docs/first-change.md first.', 'Then edit.'] } },
        { type: 'step-unnumbered', id: 'changes', title: 'Keep track', lead: 'What changed.', links: [{ label: 'Limits', href: { anchor: 'files' } }] },
      ],
    },
  ],
};

describe('renderTwins', () => {
  const [twin, task] = renderTwins([outline], MAP);
  const content = twin?.content ?? '';

  it("publishes an agent task's text alone next to its page's twin, with the site's address filled in, and keeps an unnumbered step unnumbered", () => {
    expect(task?.path).toBe('/templates/template-shell/agent-task.md');
    expect(task?.title).toBe('Task for your agent');
    expect(task?.content).toBe(`Read ${ORIGIN}/docs/first-change.md first.\nThen edit.\n`);
    expect(content).toContain('## Keep track\n\nWhat changed.\n\n- [Limits](#files)');
  });

  it('renders the key files with their content as fenced code, using a fence the content cannot close', () => {
    expect(content).toContain('### src/main.tsx');
    expect(content).toContain('The entry. (2 lines)');
    expect(content).toContain('File at the pinned commit: https://example.invalid/blob/main.tsx');
    expect(content).toContain('````tsx\nconst fence = "```";\nexport {};\n````');
  });

  it('renders the example screens as links through their canonical addresses, the pinned source and the toolchain line', () => {
    expect(content).toContain(`- [Home](${ORIGIN}/?screen=home)`);
    expect(content).toContain(`[Open example](${ORIGIN}/?screen=home)`);
    expect(content).toContain('Source: 3b6cddb (https://example.invalid/tree/3b6cddb)');
    expect(content).toContain('Node.js 25 and npm 10 | FrontX CLI 1.2.3');
  });

  it('fills data placeholders of an external address, writes an anchor as one and lists the shell packages without an install line', () => {
    expect(content).toContain('- [Docs](https://example.invalid/kit)');
    expect(content).toContain('- [Start](#files)');
    expect(content).toContain('- @gears-frontx/react 2.0.0: React bindings.');
    expect(content).not.toContain('npm install @gears-frontx/react');
    expect(content).toContain('npm install @gears-frontx/ui-kit@1.0.0');
  });
});

describe('renderTwins entry types', () => {
  const page = (entries: Record<string, unknown>[]) => renderTwins([{ ...outline, pages: [{ route: '/template-shell', title: 'Page', lead: 'Lead.', entries }] }], MAP)[0]?.content ?? '';

  it('renders every content-page arrangement under its own entry type, with the renamed headings and card arrangements', () => {
    const content = page([
      { type: 'section-heading', id: 'a', title: 'Section', lead: 'Section lead.', label: 'Label' },
      { type: 'guide-closing-heading', id: 'b', title: 'Closing', lead: 'Closing lead.' },
      { type: 'step', id: 'one', title: 'First' },
      { type: 'step-unnumbered', id: 'aside', title: 'Aside', lead: 'Not counted.' },
      { type: 'step', id: 'two', title: 'Second' },
      ...['path-cards', 'start-paths', 'template-pair', 'template-row', 'card-tiles'].map((type) => ({ type, items: [{ title: type, text: 'Card.', href: { extension: 'ext.home' } }] })),
      { type: 'cta-rule', title: 'Next', text: 'Go on.', action: { label: 'Open', href: { anchor: 'a' } } },
      { type: 'troubleshooting', id: 'faq', title: 'Problems', items: [{ summary: 'It fails', text: 'Retry.' }] },
    ]);
    expect(content).toContain('## Section\n\nSection lead.\n\n## Closing\n\nClosing lead.');
    expect(content).toContain('## 1. First\n\n## Aside\n\nNot counted.\n\n## 2. Second');
    for (const type of ['path-cards', 'start-paths', 'template-pair', 'template-row', 'card-tiles']) expect(content).toContain(`- [${type}](${ORIGIN}/?screen=home): Card.`);
    expect(content).toContain('## Next\n\nGo on.\n\n- [Open](#a)');
    expect(content).toContain('## Problems\n\n**It fails**\n\nRetry.');
  });

  it('renders the home entries: hero actions, features, the architecture map, the change story, the kit showcase, the metrics without figures, the logo strip, the steps and the closing call', () => {
    const content = page([
      { type: 'hero', art: 'A shell with screens', actions: [{ label: 'Get started', href: { extension: 'ext.docs', action: { type: 'show_guide', payload: { guide: 'get-started' } } }, primary: true }] },
      { type: 'features', id: 'groundwork', title: 'Groundwork', items: [{ figure: 'hub', title: 'One shell', text: 'Screens plug in.', link: { label: 'Read', href: { extension: 'ext.docs' } } }] },
      {
        type: 'architecture-map',
        id: 'architecture',
        label: 'Architecture',
        title: 'How it fits',
        lead: 'Three layers.',
        map: {
          label: 'The kit and the rules feed the shell, which hosts the screens.',
          kit: { title: 'UI kit', note: 'Components', href: { extension: 'ext.catalogue' } },
          rules: { title: 'Rules', href: { extension: 'ext.docs' } },
          shell: { title: 'Shell', href: { extension: 'ext.templates' }, templates: { label: 'Templates', href: { extension: 'ext.templates' } } },
          screens: [{ title: 'Inbox', hint: 'A demo', href: { extension: 'ext.inbox-mail' } }],
          wires: { kit: 'styles', rules: 'checks' },
        },
      },
      {
        type: 'change-story',
        id: 'change',
        title: 'Change a screen',
        lead: 'Ask an agent.',
        link: { label: 'Try it', href: { extension: 'ext.docs', action: { type: 'show_guide', payload: { guide: 'first-change' } } } },
        task: { before: 'Rename ', emphasis: 'the menu entry', after: ' to Mail.' },
        diff: { path: 'src/i18n/en.json', removed: '"title": "Inbox"', added: '"title": "Mail"' },
        result: { label: 'Result', nav: 'Mail', title: 'Mail', text: 'Your messages.' },
      },
      { type: 'kit-showcase', id: 'kit', label: 'UI kit', title: 'The kit', lead: 'Live parts.', link: { label: 'All components', href: { extension: 'ext.catalogue' } }, groups: [{ title: 'Forms', tiles: [{ title: 'Button', sample: 'button', href: { extension: 'ext.catalogue', action: { type: 'show_component', payload: { component: 'button' } } } }] }] },
      { type: 'metric-comparison', id: 'metrics', title: 'Why', lead: 'Less work.', note: 'Illustrative comparison', metrics: [{ title: 'Delivery', unit: 'weeks', statement: 'Faster', benefit: 'delivery', bars: [{ label: 'FrontX', share: 30, featured: true }], text: 'Screens ship alone.' }] },
      { type: 'metric-comparison', id: 'plain', title: 'Plain', lead: 'In words.', note: '', metrics: [{ title: 'Foundation', unit: '', statement: 'Start', benefit: 'with a shell', bars: [], text: 'Templates first.' }] },
      { type: 'logo-strip', id: 'teams', title: 'Teams', logos: [{ name: 'Acme', logo: 'acme.svg', width: 100, height: 20, href: { url: 'https://acme.example/' } }] },
      { type: 'get-started-steps', id: 'steps', title: 'Get started', lead: 'Three steps.', link: { label: 'Guide', href: { extension: 'ext.docs' } }, steps: [{ figure: 'rest', title: 'Install', text: 'Run npm.', href: { extension: 'ext.docs', action: { type: 'show_guide', payload: { guide: 'get-started' } } } }] },
      { type: 'closing-cta', id: 'closing', title: 'Build with FrontX', actions: [{ label: 'Start', href: { extension: 'ext.docs' }, primary: true }] },
    ]);
    expect(content).toContain(`# Page\n\nLead.\n\nPage: ${ORIGIN}/?screen=templates;route=template-shell\n\n- [Get started](${ORIGIN}/?screen=docs;route=get-started)\n\n## Groundwork`);
    expect(content).not.toContain('A shell with screens');
    expect(content).toContain(`## Groundwork\n\n### One shell\n\nScreens plug in.\n\n- [Read](${ORIGIN}/?screen=docs)`);
    expect(content).toContain(`## How it fits\n\nThree layers.\n\nThe kit and the rules feed the shell, which hosts the screens.\n\n- [UI kit](${ORIGIN}/?screen=catalogue): Components\n- [Rules](${ORIGIN}/?screen=docs)\n- [Shell](${ORIGIN}/?screen=templates)\n- [Templates](${ORIGIN}/?screen=templates)\n- [Inbox](${ORIGIN}/?screen=inbox-mail): A demo`);
    expect(content).toContain('## Change a screen\n\nAsk an agent.\n\nTask: Rename the menu entry to Mail.\n\n**src/i18n/en.json**\n\n```diff\n- "title": "Inbox"\n+ "title": "Mail"\n```\n\nResult: the menu entry Mail shows the title "Mail" and the text "Your messages."');
    expect(content).toContain(`- [Try it](${ORIGIN}/?screen=docs;route=first-change)`);
    expect(content).toContain(`## The kit\n\nLive parts.\n\n### Forms\n\n- [Button](${ORIGIN}/?screen=catalogue;route=components/button)\n\n- [All components](${ORIGIN}/?screen=catalogue)`);
    expect(content).toContain('## Why\n\nLess work.\n\n### Delivery (weeks)\n\nFaster delivery\n\nScreens ship alone.\n\nIllustrative comparison');
    expect(content).not.toContain('30');
    expect(content).toContain('## Plain\n\nIn words.\n\n### Foundation\n\nStart with a shell\n\nTemplates first.\n\n## Teams');
    expect(content).toContain('## Teams\n\n- [Acme](https://acme.example/)');
    expect(content).toContain(`## Get started\n\nThree steps.\n\n- [Install](${ORIGIN}/?screen=docs;route=get-started): Run npm.\n\n- [Guide](${ORIGIN}/?screen=docs)`);
    expect(content).toContain(`## Build with FrontX\n\n- [Start](${ORIGIN}/?screen=docs)`);
  });

  it('joins the authored line breaks of titles and link labels with a space, so a heading or a link stays on one line', () => {
    const twin = renderTwins([{ ...outline, pages: [{ route: '/template-shell', title: 'Build apps.\nTogether.', lead: 'Lead.', entries: [
      { type: 'architecture-map', id: 'm', title: 'One shell.\nIndependent screens.', lead: 'Lead.', map: { label: 'Map.', kit: { title: 'UI Kit', href: { extension: 'ext.catalogue' } }, rules: { title: 'Design\nGuardrails', href: { extension: 'ext.docs' } }, shell: { title: 'Shell', href: { extension: 'ext.templates' }, templates: { label: 'Templates', href: { extension: 'ext.templates' } } }, screens: [], wires: { kit: 'a', rules: 'b' } } },
      { type: 'closing-cta', id: 'c', title: 'Start with FrontX.\nKeep your app yours.', actions: [{ label: 'Start', href: { extension: 'ext.docs' }, primary: true }] },
    ] }] }], MAP)[0]?.content ?? '';
    expect(twin).toContain('# Build apps. Together.\n');
    expect(twin).toContain('## One shell. Independent screens.\n');
    expect(twin).toContain(`- [Design Guardrails](${ORIGIN}/?screen=docs)`);
    expect(twin).toContain('## Start with FrontX. Keep your app yours.\n');
  });

  it('renders nothing for an entry type it does not know, such as section or cards', () => {
    const content = page([{ type: 'section', id: 'x', title: 'Old' }, { type: 'cards', items: [{ title: 'Old card', href: { extension: 'ext.home' } }] }, { type: 'paragraph', text: 'Kept.' }]);
    expect(content).not.toContain('Old');
    expect(content).toContain('Kept.');
  });

  it("reads a page from its entries list only", () => {
    const [twin] = renderTwins([{ ...outline, pages: [{ route: '/template-shell', title: 'Page', lead: 'Lead.', blocks: [{ type: 'paragraph', text: 'Former.' }] }] }], MAP);
    expect(twin?.content).not.toContain('Former.');
  });

  it('refuses a link to a screen extension the site does not have, a show action whose payload names no page or more than one page of it, a screen named by its address token and a route beside an extension', () => {
    const link = (href: Record<string, unknown>) => () => page([{ type: 'links', items: [{ label: 'Go', href }] }]);
    expect(link({ extension: 'ext.nowhere' })).toThrow(/screen extension ext\.nowhere, which the site does not have/);
    expect(link({ extension: 'ext.docs', action: { type: 'show_guide', payload: { guide: 'missing' } } })).toThrow(/names no page/);
    expect(link({ extension: 'ext.docs', action: { type: 'show_guide', payload: { guide: 'get-started', page: 'first-change' } } })).toThrow(/names no page/);
    expect(link({ screen: 'docs', route: '/get-started' })).toThrow(/by its address token/);
    expect(link({ extension: 'ext.docs', route: '/get-started' })).toThrow(/with a route/);
    const twice = buildPageMap(CONFIG, ORIGIN, 'screen', [...EXTENSIONS, { id: 'ext.twice', route: '/twice', packageName: 'twice-mfe', presentation: { label: 'Twice', order: 90 }, seo: { title: 'Twice', description: describeText('Twice'), routes: { '/a/x': { title: 'A', description: describeText('A') }, '/b/x': { title: 'B', description: describeText('B') } } } }]);
    const linkTwice = () => renderTwins([{ ...outline, pages: [{ route: '/template-shell', title: 'Page', lead: 'Lead.', entries: [{ type: 'links', items: [{ label: 'Go', href: { extension: 'ext.twice', action: { type: 'show', payload: { page: 'x' } } } }] }] }] }], twice);
    expect(linkTwice).toThrow(/names more than one page/);
    expect(link({ extension: 'ext.docs', action: { type: 'show_guide', payload: { guide: 'get-started' } } })).not.toThrow();
  });
});

describe('twinPath', () => {
  // The screens link a twin with their own copy of this rule; the repository holds the two copies to one answer (scripts/twin-paths.test.mjs in the FrontX site repository).
  it('publishes the screen root as index.md and a route at its own path, and an agent task beside its page', () => {
    expect(twinPath('docs', '/')).toBe('/docs/index.md');
    expect(twinPath('docs', '/a/b')).toBe('/docs/a/b.md');
    expect(taskTwinPath('docs', '/first-change', 'agent-task')).toBe('/docs/first-change/agent-task.md');
  });
});
