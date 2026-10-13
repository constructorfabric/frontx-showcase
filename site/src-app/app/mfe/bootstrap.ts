/**
 * MFE Bootstrap
 *
 * Registers MFE domains, extensions, and handlers with the FrontX app.
 *
 * MFE manifest configs are fetched at runtime from `generated-mfe-manifests.json`
 * under the build's base, resolved against the document (`manifestsUrl`), so a
 * build made with a relative base reads its own copy wherever it is mounted. The
 * file is a public asset produced by `scripts/generate-mfe-manifests.ts` before
 * each `vite dev` / `vite build`; the JSON shape is identical to what the future
 * backend API will return so the transport swap is a one-line URL change here.
 *
 * A `publicPath` in the file may be relative (the production layout writes
 * `mfe/<package>/`); the MFE handler resolves it against the document, which
 * sits in the same folder as the file.
 */

import {
  ExtensionDomainImplementation,
  ExtensionDomainImplementationFactory,
  ExclusiveMountStrategy,
  OptionalMountStrategy,
  ActionHandler,
  FRONTX_ACTION_MOUNT_EXT,
  FRONTX_ACTION_UNMOUNT_EXT,
  FRONTX_SHARED_PROPERTY_THEME,
  FRONTX_SHARED_PROPERTY_LANGUAGE,
  screenDomain,
  sidebarDomain,
  popupDomain,
  overlayDomain,
} from '@gears-frontx/react';
import type {
  FrontXApp,
  Extension,
  ExtensionDomain,
  MfManifest,
  MfeEntryMF,
  JSONSchema,
  MfeRegistry,
  ContainerHooks,
  DomainContext,
  ActionPayload,
  MountStrategy,
} from '@gears-frontx/react';
import {
  CHROME_ACTION_SCHEMAS,
  CHROME_SET_MENU_COLLAPSED,
  CHROME_SET_THEME,
} from './chrome-actions';
import { screenLoadFailure } from './screenLoadFailure';

const MFE_MANIFESTS_FILE = 'generated-mfe-manifests.json';

/**
 * Where the manifest aggregate is served: under the build's base, resolved against the document. The dev server's base is `/`; a production build with the relative base `./` resolves to the folder the document is served from, the root of an origin or any sub-path.
 * @param base - the build's base (`import.meta.env.BASE_URL`)
 * @param documentUrl - the address the document resolves relative references against
 */
// @cpt-algo:cpt-site-algo-production-build-layout-resolve-addresses:p2
export function manifestsUrl(base: string = import.meta.env.BASE_URL, documentUrl: string = document.baseURI): string {
  // @cpt-begin:cpt-site-algo-production-build-layout-resolve-addresses:p2:inst-aggregate-address
  return new URL(`${base.endsWith('/') ? base : `${base}/`}${MFE_MANIFESTS_FILE}`, documentUrl).href;
  // @cpt-end:cpt-site-algo-production-build-layout-resolve-addresses:p2:inst-aggregate-address
}

/**
 * Shape of each MFE manifest config in the generated JSON.
 * Matches the output of scripts/generate-mfe-manifests.ts. `extensions` is
 * optional because an MFE may declare only loadable entries (with no
 * default wiring); the consumer chooses how those entries get wired into
 * domains. Self-declared `extensions[]` are still supported for MFEs that
 * propose default wirings the host should pick up. `domains` is optional
 * because most MFEs target host-owned domains; an MFE declares `domains`
 * only when it owns an ExtensionDomain instance (e.g., demo-mfe owns the
 * widgets domain - registered here so extensions targeting that domain
 * resolve content-addressed at the runtime store).
 */
interface MfeManifestConfig {
  manifest: MfManifest;
  domains?: ExtensionDomain[];
  entries: MfeEntryMF[];
  extensions?: Extension[];
  schemas?: JSONSchema[];
}

// ─── Domain implementation building blocks ───────────────────────────────────
//
// The redesigned domain model owns mount semantics inside the domain
// implementation. Each domain registered with the registry pairs an
// `ExtensionDomain` declaration with an `ExtensionDomainImplementationFactory`
// whose `build(ctx)` constructs an `ExtensionDomainImplementation`. The
// implementation captures the per-domain mounter and a `ContainerHooks`
// inside its chosen `MountStrategy` and registers per-action-type handlers
// that delegate to the strategy.

class HostContainerHooks implements ContainerHooks {
  private readonly elements = new Map<string, HTMLElement>();

  create(extensionId: string): Element {
    const el = document.createElement('div');
    el.dataset.extensionId = extensionId;
    el.style.height = '100%';
    this.elements.set(extensionId, el);
    return el;
  }

  destroy(extensionId: string, container?: Element): void {
    if (!container || this.elements.get(extensionId) === container) {
      this.elements.delete(extensionId);
    }
  }
}

// The two readers below state, to TypeScript, an invariant the type system
// already enforces at runtime: `chrome-actions.ts` closes each chrome payload
// around a single required field of a declared type, and the mediator validates
// an action against that schema before it resolves any handler for it. So a
// handler never sees a payload missing its field, and neither reader is a
// refusal path a caller can trigger - reaching a throw means the schema and the
// handler disagree about the payload, which is a defect in one of the two.

function readThemeId(payload: Record<string, unknown> | undefined): string {
  const themeId = payload?.themeId;
  if (typeof themeId !== 'string') {
    throw new Error(
      '[MFE Bootstrap] set_theme payload has no string themeId; the action schema should have refused this action before it reached the handler',
    );
  }
  return themeId;
}

function readCollapsed(payload: Record<string, unknown> | undefined): boolean {
  const collapsed = payload?.collapsed;
  if (typeof collapsed !== 'boolean') {
    throw new Error(
      '[MFE Bootstrap] set_menu_collapsed payload has no boolean collapsed; the action schema should have refused this action before it reached the handler',
    );
  }
  return collapsed;
}

class ScreenDomainImpl extends ExtensionDomainImplementation {
  private readonly strategy: ExclusiveMountStrategy;

  constructor(
    ctx: DomainContext,
    hooks: ContainerHooks,
    registry: MfeRegistry,
    domainId: string,
    app: FrontXApp,
  ) {
    super();
    this.strategy = new ExclusiveMountStrategy(ctx.mounter, hooks, registry, domainId);
    // The injected framework router's own settled-action report path (the
    // mount execution algorithm of the FrontX extension domain governance
    // feature) reflects this mount into the URL once the strategy settles -
    // no domain-implementation call is needed for it.
    // A failed mount is reported for the screen container's error state and still fails the action.
    // @cpt-dod:cpt-site-dod-production-build-layout-failure-report:p2
    // @cpt-algo:cpt-site-algo-production-build-layout-report-mount-failure:p2
    ctx.registerHandler(
      FRONTX_ACTION_MOUNT_EXT,
      ActionHandler.fromFunction(async (_t, p) => {
        try {
          // @cpt-begin:cpt-site-algo-production-build-layout-report-mount-failure:p2:inst-try-mount
          await this.strategy.mount(p as ActionPayload);
          // @cpt-end:cpt-site-algo-production-build-layout-report-mount-failure:p2:inst-try-mount
        } catch (error) {
          // @cpt-begin:cpt-site-algo-production-build-layout-report-mount-failure:p2:inst-catch-report
          const subject = p?.subject;
          const history = p?.history;
          screenLoadFailure.report(typeof subject === 'string' ? subject : undefined, history === 'replace' || history === 'none' ? history : 'push');
          throw error;
          // @cpt-end:cpt-site-algo-production-build-layout-report-mount-failure:p2:inst-catch-report
        }
        // @cpt-begin:cpt-site-algo-production-build-layout-report-mount-failure:p2:inst-clear-on-success
        screenLoadFailure.clear();
        // @cpt-end:cpt-site-algo-production-build-layout-report-mount-failure:p2:inst-clear-on-success
      }),
    );
    // The host chrome a mounted screen may drive. The one thing neither the
    // action schema nor the domain declaration can decide is whether THIS host
    // runs the plugin the action needs - `themes` and `layout` are both opt-in
    // - so each handler resolves rather than throws when it does not: chrome is
    // decoration around a screen, and a request the shell cannot honour should
    // leave the screen running instead of failing its chain.
    ctx.registerHandler(
      CHROME_SET_THEME,
      ActionHandler.fromFunction((_t, p) => {
        if (typeof app.actions.changeTheme !== 'function') {
          console.warn('[MFE Bootstrap] set_theme ignored: no themes plugin on this host');
        } else {
          app.actions.changeTheme({ themeId: readThemeId(p) });
        }
        return Promise.resolve();
      }),
    );
    ctx.registerHandler(
      CHROME_SET_MENU_COLLAPSED,
      ActionHandler.fromFunction((_t, p) => {
        if (typeof app.actions.toggleMenuCollapsed !== 'function') {
          console.warn('[MFE Bootstrap] set_menu_collapsed ignored: no layout plugin on this host');
        } else {
          app.actions.toggleMenuCollapsed({ collapsed: readCollapsed(p) });
        }
        return Promise.resolve();
      }),
    );
  }

  protected getMountStrategies(): MountStrategy[] {
    return [this.strategy];
  }
}

class OptionalDomainImpl extends ExtensionDomainImplementation {
  private readonly strategy: OptionalMountStrategy;

  constructor(ctx: DomainContext, hooks: ContainerHooks, registry: MfeRegistry, domainId: string) {
    super();
    this.strategy = new OptionalMountStrategy(ctx.mounter, hooks, registry, domainId);
    ctx.registerHandler(
      FRONTX_ACTION_MOUNT_EXT,
      ActionHandler.fromFunction(async (_t, p) => {
        await this.strategy.mount(p as ActionPayload);
      }),
    );
    ctx.registerHandler(
      FRONTX_ACTION_UNMOUNT_EXT,
      ActionHandler.fromFunction(async (_t, p) => {
        await this.strategy.unmount!(p as ActionPayload);
      }),
    );
  }

  protected getMountStrategies(): MountStrategy[] {
    return [this.strategy];
  }
}

class ScreenDomainFactory extends ExtensionDomainImplementationFactory {
  constructor(
    private readonly registry: MfeRegistry,
    private readonly app: FrontXApp,
  ) { super(); }
  build(ctx: DomainContext): ScreenDomainImpl {
    return new ScreenDomainImpl(ctx, new HostContainerHooks(), this.registry, screenDomain.id, this.app);
  }
}

class OptionalDomainFactory extends ExtensionDomainImplementationFactory {
  constructor(
    private readonly registry: MfeRegistry,
    private readonly domainId: string,
  ) { super(); }
  build(ctx: DomainContext): OptionalDomainImpl {
    return new OptionalDomainImpl(ctx, new HostContainerHooks(), this.registry, this.domainId);
  }
}

/**
 * Scoped schema registration: only register schemas whose $id matches an action ID
 * declared by at least one entry in this package. Action schemas are validated
 * against declared entry actions; non-action schemas (derived ExtensionDomain
 * and Extension type schemas owned by parent MFEs) are registered separately
 * via `registerNonActionSchemas` because they have no action ID counterpart.
 */
function collectDeclaredActionIds(entries: MfeEntryMF[]): Set<string> {
  const declaredActionIds = new Set<string>();
  for (const entry of entries) {
    for (const actionId of entry.actions) declaredActionIds.add(actionId);
    for (const actionId of entry.domainActions) declaredActionIds.add(actionId);
  }
  return declaredActionIds;
}

const GTS_SCHEMA_ID_PREFIX = 'gts://';

/** A schema's `$id` is its type id behind the `gts://` prefix, so it is an action schema exactly when that type id is a declared action id. */
function isDeclaredActionSchema(schemaId: string, declaredActionIds: ReadonlySet<string>): boolean {
  return schemaId.startsWith(GTS_SCHEMA_ID_PREFIX) && declaredActionIds.has(schemaId.slice(GTS_SCHEMA_ID_PREFIX.length));
}

function registerScopedSchemas(
  registry: MfeRegistry,
  schemas: JSONSchema[],
  declaredActionIds: Set<string>,
): void {
  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-packages
  for (const schema of schemas) {
    const schemaId = schema.$id;
    if (!schemaId) continue;
    if (isDeclaredActionSchema(schemaId, declaredActionIds)) {
      registry.typeSystem.registerSchema(schema);
    }
  }
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-packages
}

/**
 * Register schemas that are not action schemas. Derived `ExtensionDomain` and
 * `Extension` type schemas declared by a parent MFE (e.g., demo-mfe's widgets
 * domain derived schema) must be registered before any leaf MFE's extension
 * instance is validated against the chain - per the schema registration
 * rule of the FrontX MFE registry feature (parent registers schemas before
 * entries / extensions). The action-id-match filter
 * in `registerScopedSchemas` does not apply to these schemas because their
 * `$id` is a domain or extension type ID, not an action ID.
 *
 * `gtsPlugin.registerSchema` accepts a schema registered twice, so
 * registering all non-action schemas across all packages in a first pass
 * is safe and keeps the schema chain available before any leaf-MFE extension
 * registration.
 */
function registerNonActionSchemas(
  registry: MfeRegistry,
  schemas: JSONSchema[],
  declaredActionIds: Set<string>,
): void {
  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-non-action-schemas
  for (const schema of schemas) {
    const schemaId = schema.$id;
    if (!schemaId) continue;
    if (!isDeclaredActionSchema(schemaId, declaredActionIds)) {
      registry.typeSystem.registerSchema(schema);
    }
  }
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-non-action-schemas
}

/**
 * First pass over every package: register all non-action schemas on the gts
 * singleton so leaf-MFE extension validation later in the second pass can chain
 * through derived schemas declared by parent MFEs (regardless of iteration
 * order in `generated-mfe-manifests.json`).
 */
function registerAllNonActionSchemas(
  registry: MfeRegistry,
  manifests: readonly MfeManifestConfig[],
): void {
  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-non-action-schemas
  for (const config of manifests) {
    if (!config.schemas) continue;
    registerNonActionSchemas(
      registry,
      config.schemas,
      collectDeclaredActionIds(config.entries),
    );
  }
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-non-action-schemas
}

/**
 * Returns true when the given domain ID is registered on the host registry -
 * i.e., this host owns the domain and is responsible for registering its
 * extensions. Foreign-domain extensions (those whose target domain is owned by
 * a different runtime, like the widgets domain owned by demo-mfe's child
 * FrontX app) MUST NOT be registered on the host registry; they reach their
 * owning runtime through a content-addressed dispatcher (per Phase 2.6 -
 * the content-addressed discovery of the FrontX framework composition
 * feature).
 */
function hostOwnsDomain(registry: MfeRegistry, domainId: string): boolean {
  return registry.getDomain(domainId) !== undefined;
}

async function registerMfePackage(
  registry: MfeRegistry,
  config: MfeManifestConfig,
): Promise<void> {
  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-packages
  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-action-schemas
  if (config.schemas) {
    registerScopedSchemas(registry, config.schemas, collectDeclaredActionIds(config.entries));
  }
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-action-schemas
  // register() validates each instance against its schema and throws on
  // failure - invalid manifests/entries fail startup loudly rather than
  // persisting broken state into the registry. The aggregator script inlines
  // the resolved MfManifest object into each entry's `manifest` field so the
  // host registers entries opaquely - no spread/override needed here.
  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-declarations
  registry.typeSystem.register(config.manifest);
  // Registration order: schemas → manifest → domains → entries → extensions.
  // Domains MUST be registered before any extension references them so the
  // content-addressed dispatcher can resolve target-domain ownership at the
  // GTS runtime store. Domain registration is opaque - the aggregator passes
  // each `ExtensionDomain` instance through verbatim.
  for (const domain of config.domains ?? []) {
    console.info(`[MFE Bootstrap] Registering domain ${domain.id}`);
    registry.typeSystem.register(domain);
  }
  for (const entry of config.entries) {
    registry.typeSystem.register(entry);
  }
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-declarations
  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-extensions
  for (const extension of config.extensions ?? []) {
    // Only extensions whose target domain is owned by this host registry are
    // registered here. Extensions targeting a domain owned by another FrontX
    // app (e.g., widgets-fixture-a's two widget extensions target the widgets
    // domain owned by demo-mfe's child app) are dispatched to the owning
    // runtime by that runtime's own bootstrap.
    if (!hostOwnsDomain(registry, extension.domain)) {
      // This host doesn't own the target domain, so it must not admit/mount
      // this extension - but the declaration still has to be on the type
      // system: `x-gts-ref` admission validation for an action originating
      // here (e.g. Hello World's ping dispatched at the shell's own registry,
      // escalating down to widget-a two hops away) checks referenced entities
      // against the store before the action ever reaches cross-hop routing.
      // Every `GtsPlugin` copy of the realm shares that store, so the
      // declaration registered here is the one every runtime of the page
      // sees; an isolated `GtsPlugin` keeps a private store and does not
      // share it. Registering opaquely here (no `registerExtension`/mounting)
      // admits nothing for mounting.
      registry.typeSystem.register(extension);
      continue;
    }
    await registry.registerExtension(extension);
    // The extension's own entry address, if it declares a route, is
    // supplied automatically at mount through the injected router's occupant
    // value (ADR 0036) - no shared-property broadcast to keep in step with
    // registration.
  }
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-extensions
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-packages
}

/**
 * Bootstrap MFE system for the host application.
 *
 * Registers the chrome action schemas on the registry's type system first,
 * then synchronously registers the four well-known domains (screen, sidebar,
 * popup, overlay) - the injected framework router (`app.mfeRouter`) admits
 * each one automatically through the runtime's router port (the FrontX ADR
 * on the extension routing port); no shell-owned routing wiring is built
 * here. It then broadcasts the initial shared properties
 * (theme, language) and asynchronously registers the extensions declared in
 * `generated-mfe-manifests.json`.
 *
 * Mount/unmount lifecycle is not driven here: `ExtensionDomainSlot` itself
 * starts/stops a routed domain's own URL observer from its own attach/detach
 * (ADR 0036, D10/D11) - this function builds no routing wiring at all.
 *
 * @param app - FrontX application instance
 */
// @cpt-flow:cpt-site-flow-production-build-layout-load-screens:p2
// @cpt-dod:cpt-site-dod-production-build-layout-mount-independent-bootstrap:p2
export async function bootstrapMFE(app: FrontXApp): Promise<void> {
  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-if-no-registry
  const registry = app.mfeRegistry;
  if (!registry) {
    throw new Error('[MFE Bootstrap] mfeRegistry is not available on app instance');
  }
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-if-no-registry

  // The chrome action schemas must be on the type system before any action
  // carrying one of these types can be dispatched, and `registerDomain` is the
  // first thing a mounted screen can act against.
  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-chrome-schemas
  for (const schema of CHROME_ACTION_SCHEMAS) {
    registry.typeSystem.registerSchema(schema);
  }
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-chrome-schemas

  // The shipped `screenDomain` is spread rather than edited: the framework
  // declaration stays the default every template gets, and this shell opts
  // itself into the two chrome actions its handlers above answer. The
  // declaration's `extensionsActions` is deliberately untouched - listing them
  // there would make them mandatory for every screen extension in the repo.
  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-domains
  registry.registerDomain(
    { ...screenDomain, actions: [...screenDomain.actions, CHROME_SET_THEME, CHROME_SET_MENU_COLLAPSED] },
    new ScreenDomainFactory(registry, app),
  );
  registry.registerDomain(sidebarDomain, new OptionalDomainFactory(registry, sidebarDomain.id));
  registry.registerDomain(popupDomain, new OptionalDomainFactory(registry, popupDomain.id));
  registry.registerDomain(overlayDomain, new OptionalDomainFactory(registry, overlayDomain.id));
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-domains

  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-broadcast-properties
  const currentThemeId = app.themeRegistry?.getCurrent()?.id ?? 'default';
  registry.updateSharedProperty(FRONTX_SHARED_PROPERTY_THEME, currentThemeId);
  const derivedLanguage = app.i18nRegistry.getLanguage();
  registry.updateSharedProperty(FRONTX_SHARED_PROPERTY_LANGUAGE, derivedLanguage ?? 'en');
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-broadcast-properties

  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-resolve-aggregate-url
  const aggregateUrl = manifestsUrl();
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-resolve-aggregate-url
  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-fetch-aggregate
  console.info(`[MFE Bootstrap] Fetching MFE manifests from ${aggregateUrl}`);
  const response = await fetch(aggregateUrl);
  if (!response.ok) {
    throw new Error(
      `[MFE Bootstrap] Failed to load MFE manifests from ${aggregateUrl}: ${response.status} ${response.statusText}`,
    );
  }
  const manifests = (await response.json()) as MfeManifestConfig[];
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-fetch-aggregate

  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-if-empty
  if (manifests.length === 0) {
    console.warn(
      '[MFE Bootstrap] No MFE manifests found. Run `npm run generate:mfe-manifests` to generate them.',
    );
    return;
  }
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-if-empty
  // First pass: register every package's non-action schemas (derived
  // ExtensionDomain / Extension type schemas) so leaf-MFE extension validation
  // in the second pass can chain through them regardless of manifest order.
  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-non-action-schemas
  registerAllNonActionSchemas(registry, manifests);
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-non-action-schemas
  // @cpt-begin:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-packages
  for (const config of manifests) {
    await registerMfePackage(registry, config);
  }
  // @cpt-end:cpt-site-flow-production-build-layout-load-screens:p2:inst-register-packages
}
