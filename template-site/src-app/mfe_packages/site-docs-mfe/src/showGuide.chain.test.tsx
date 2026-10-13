/**
 * A cross-screen link to a guide of the docs screen, end to end through the real FrontX pieces: the host app's framework router and mediator validating the action against the docs package's own schema, the screen domain's `ExclusiveMountStrategy` behind a real `ExtensionDomainSlot`, the real `mount_ext` + `next` chain `openScreen` sends, and the docs screen's real `show_guide` handler moving its own app's router through the navigation facade.
 *
 * Only the module-federation network load is replaced (`MfeHandlerMF.load`, as template-mfe's widgets host remount test does): each screen is a small lifecycle. The target builds its own app, from its own copy of the FrontX modules, on first mount, the way a screen package's module-level app is first read inside the mount window, so the host links it and supplies its occupant value.
 */
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ActionHandler,
  createFrontX,
  effects,
  ExclusiveMountStrategy,
  ExtensionDomainImplementation,
  ExtensionDomainImplementationFactory,
  ExtensionDomainSlot,
  FRONTX_ACTION_MOUNT_EXT,
  FRONTX_MFE_ENTRY_MF,
  FRONTX_SHARED_PROPERTY_LANGUAGE,
  FRONTX_SHARED_PROPERTY_THEME,
  gtsPlugin,
  MfeHandlerMF,
  microfrontends,
  screenDomain,
  type ActionPayload,
  type ChildMfeBridge,
  type ContainerHooks,
  type DomainContext,
  type FrontXApp,
  type MfeEntryLifecycle,
  type MfeEntryMF,
  type MfeRegistry,
  type MfManifest,
  type MountStrategy,
} from '@gears-frontx/react';
import { extensionScreenSchema, languageSchema, themeSchema } from '@gears-frontx/frontx-template-shell';
import { openScreen, registerShowPageHandler } from '@site-shared/navigation/openScreen';
import { SHOW_GUIDE_ACTION } from '@site-shared/navigation/siteScreens';
import manifest from '../mfe.json';
import { showGuideHandler } from './showGuide';

const HOME_ID = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.chain_test.screens.home.v1';
const DOCS_ID = manifest.extensions[0]!.id;
const MANIFEST_ID = 'gts.frontx.mfes.mfe.mf_manifest.v1~frontx.chain_test.mfe.manifest.v1';
const HOME_ENTRY_ID = 'gts.frontx.mfes.mfe.entry.v1~frontx.mfes.mfe.entry_mf.v1~frontx.chain_test.mfe.home.v1';
const DOCS_ENTRY_ID = 'gts.frontx.mfes.mfe.entry.v1~frontx.mfes.mfe.entry_mf.v1~frontx.chain_test.mfe.docs.v1';

class Hooks implements ContainerHooks {
  create(extensionId: string): Element {
    const element = document.createElement('div');
    element.dataset.extensionId = extensionId;
    return element;
  }
  destroy(): void {}
}

/** template-shell's screen domain, reduced to its mount handler. */
class ScreenDomain extends ExtensionDomainImplementation {
  private readonly strategy: ExclusiveMountStrategy;
  constructor(ctx: DomainContext, registry: MfeRegistry) {
    super();
    this.strategy = new ExclusiveMountStrategy(ctx.mounter, new Hooks(), registry, screenDomain.id);
    ctx.registerHandler(
      FRONTX_ACTION_MOUNT_EXT,
      ActionHandler.fromFunction(async (_type, payload) => {
        await this.strategy.mount(payload as ActionPayload);
      }),
    );
  }
  protected getMountStrategies(): MountStrategy[] {
    return [this.strategy];
  }
}

class ScreenDomainFactory extends ExtensionDomainImplementationFactory {
  constructor(private readonly registry: MfeRegistry) {
    super();
  }
  build(ctx: DomainContext): ScreenDomain {
    return new ScreenDomain(ctx, this.registry);
  }
}

const MANIFEST = {
  id: MANIFEST_ID,
  name: 'chain-test',
  metaData: {
    name: 'chain-test',
    type: 'module',
    buildInfo: { buildVersion: '0.0.0-test', buildName: 'chain-test' },
    remoteEntry: { name: 'chain-test', path: '/assets/remoteEntry.js', type: 'module' },
    publicPath: 'http://localhost:0/chain-test/assets/',
  },
  shared: [],
} as unknown as MfManifest;

const entry = (id: string, actions: readonly string[] = []) =>
  ({
    id,
    requiredProperties: [],
    actions,
    domainActions: [],
    manifest: MANIFEST_ID,
    exposedModule: './lifecycle',
    exposeAssets: { js: { sync: ['assets/lifecycle.js'], async: [] }, css: { sync: [], async: [] } },
  }) as unknown as MfeEntryMF;

const screenExtension = (id: string, entryId: string, route: string) => ({ id, domain: screenDomain.id, entry: entryId, route, presentation: { label: route.slice(1), order: 1 } });

let roots: Root[] = [];
let apps: FrontXApp[] = [];

afterEach(() => {
  act(() => roots.forEach((root) => root.unmount()));
  roots = [];
  apps.forEach((app) => app.destroy());
  apps = [];
  vi.restoreAllMocks();
  document.body.replaceChildren();
  window.history.replaceState(null, '', '/');
});

async function until(condition: () => boolean, what: string): Promise<void> {
  await vi.waitFor(() => {
    if (!condition()) throw new Error(`waiting for ${what}`);
  });
}

describe('openScreen with the show_guide action, through the real router', () => {
  it('makes one history entry naming the docs screen at the guide, without reloading, and Back returns to the previous screen', async () => {
    window.history.replaceState(null, '', '/');
    const host = createFrontX()
      .use(effects())
      .use(microfrontends({ typeSystem: gtsPlugin, mfeHandlers: [new MfeHandlerMF(FRONTX_MFE_ENTRY_MF)] }))
      .build();
    apps.push(host);
    const registry = host.mfeRegistry!;
    // The target screen is its own runtime with its own copy of the FrontX modules, as a federated remote is: a runtime builds exactly one app.
    vi.resetModules();
    const child = await import('@gears-frontx/react');

    let homeBridge: ChildMfeBridge | undefined;
    let homeMounts = 0;
    let docsApp: FrontXApp | undefined;
    vi.spyOn(MfeHandlerMF.prototype, 'load').mockImplementation(async (loaded: MfeEntryMF): Promise<MfeEntryLifecycle<ChildMfeBridge>> => {
      if (loaded.id === HOME_ENTRY_ID) {
        return {
          mount: (_container, bridge) => {
            homeMounts += 1;
            homeBridge = bridge;
          },
          unmount: () => undefined,
        };
      }
      return {
        mount: (_container, bridge) => {
          // The screen package's app, first read inside the mount window, as a module-level app is.
          docsApp ??= child.createFrontX().use(child.microfrontends({ typeSystem: child.gtsPlugin })).build();
          void docsApp.mfeRegistry;
          registerShowPageHandler(bridge, SHOW_GUIDE_ACTION, showGuideHandler(docsApp));
        },
        unmount: () => undefined,
      };
    });

    registry.typeSystem.registerSchema(themeSchema);
    registry.typeSystem.registerSchema(languageSchema);
    registry.typeSystem.registerSchema(extensionScreenSchema);
    for (const schema of manifest.schemas) registry.typeSystem.registerSchema(schema as never);
    registry.registerDomain(screenDomain, new ScreenDomainFactory(registry));
    registry.updateSharedProperty(FRONTX_SHARED_PROPERTY_THEME, 'light');
    registry.updateSharedProperty(FRONTX_SHARED_PROPERTY_LANGUAGE, 'en');
    registry.typeSystem.register(MANIFEST);
    registry.typeSystem.register(entry(HOME_ENTRY_ID));
    registry.typeSystem.register(entry(DOCS_ENTRY_ID, manifest.entries[0]!.actions));
    await registry.registerExtension(screenExtension(HOME_ID, HOME_ENTRY_ID, '/home') as never);
    await registry.registerExtension(screenExtension(DOCS_ID, DOCS_ENTRY_ID, '/docs') as never);

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);
    let attached = false;
    // The slot attaches in an effect, which `act` flushes once its callback returns.
    await act(async () => {
      root.render(<ExtensionDomainSlot registry={registry} domainId={screenDomain.id} onAttached={() => (attached = true)} />);
    });
    await until(() => attached, 'the screen domain slot');

    registry.executeActionsChain({ action: { type: FRONTX_ACTION_MOUNT_EXT, target: screenDomain.id, payload: { subject: HOME_ID, history: 'replace' } } });
    await until(() => window.location.search === '?screen=home' && homeBridge !== undefined, 'the home screen');
    const before = window.history.length;
    // A full page load would replace the document's window state; this marker survives only an in-page navigation.
    const pageMarker = Symbol('page');
    (window as unknown as Record<symbol, true>)[pageMarker] = true;

    openScreen(homeBridge!, { extension: DOCS_ID, action: { type: SHOW_GUIDE_ACTION, payload: { guide: 'get-started' } } });

    await until(() => window.location.search === '?screen=docs;route=get-started', 'the docs screen at the guide');
    expect(window.history.length).toBe(before + 1);
    expect((window as unknown as Record<symbol, true>)[pageMarker]).toBe(true);

    const homeMountsBeforeBack = homeMounts;
    window.history.back();
    await until(() => window.location.search === '?screen=home', 'the home screen after Back');
    await until(() => homeMounts > homeMountsBeforeBack, 'the home screen mounted again');
    expect((window as unknown as Record<symbol, true>)[pageMarker]).toBe(true);
  });
});
