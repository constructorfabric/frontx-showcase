/**
 * widgets-fixture-a - the widget's route tree and its pages.
 *
 * Module-level values here are per extension instance, as in `lifecycle.tsx`:
 * each instance (alpha, beta) loads its own copy of the bundle, so `randomHex`
 * differs between the two.
 */
import React from 'react';
import { FRONTX_ACTION_MOUNT_EXT, FRONTX_SCREEN_DOMAIN, type ChildMfeBridge } from '@gears-frontx/react';
import { createRootRoute, createRoute, Outlet, useSearch, type AnyRoute } from '@gears-frontx/routing-tanstack';
import { Button, Item, ItemContent, ItemDescription, ItemFooter, ItemTitle } from '@gears-frontx/ui-kit';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '@gears-frontx/kit-candidates';

/** The search parameter of the widget's own entry that holds the last ping's time. */
export const LAST_PING_PARAM = 'last-ping';

// @cpt-dod:cpt-template-mfe-demo-dod-widget-fixtures-widget-a:p2
// @cpt-algo:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-routes:p2
// @cpt-algo:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2
// @cpt-flow:cpt-template-mfe-demo-flow-widget-fixtures-open-isolation:p2
// @cpt-flow:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2
// @cpt-begin:cpt-template-mfe-demo-flow-widget-fixtures-open-isolation:p2:inst-target-id
// Hello World's extension ID (demo-mfe), targeted via the shell's screen
// domain - mounting it from here exercises the upward-escalation tier: this
// widget's own registry doesn't know the screen domain locally, so the
// escalation must travel through Widgets Host's inbound bridge to the shell.
const HELLOWORLD_EXTENSION_ID =
  'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.demo.screens.helloworld.v1';
  // @cpt-end:cpt-template-mfe-demo-flow-widget-fixtures-open-isolation:p2:inst-target-id

// @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-random-witness
function generateRandomHex(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Per-instance random hex. Each blob-URL-isolated load of this module produces a
// fresh value, which is the empirical witness that distinct extension
// instances backed by the same entry path get distinct module evaluations.
export const randomHex = generateRandomHex();
// @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-random-witness

// @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-routes:p2:inst-bridge-context
/** The mounted instance's bridge, for the route components. */
export const WidgetBridge = React.createContext<ChildMfeBridge | null>(null);

function useBridge(): ChildMfeBridge {
  const bridge = React.useContext(WidgetBridge);
  if (!bridge) throw new Error('widget-a: rendered outside its mount');
  return bridge;
}
// @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-routes:p2:inst-bridge-context

// @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-routes:p2:inst-instance-frame
// The instance is one kit Item drawn with an outline; its tokens come from the nested widgets screen's tree, which carries the kit's tokens on its shadow host.
function WidgetARoot(): React.ReactElement {
  const bridge = useBridge();
  return (
    <Item
      variant="outline"
      data-testid="widget-a-instance"
      data-instance-id={bridge.extensionId}
      data-instance-text={randomHex}
    >
      <Outlet />
    </Item>
  );
}
// @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-routes:p2:inst-instance-frame

// @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-routes:p2:inst-home-page
function WidgetAHome(): React.ReactElement {
  const bridge = useBridge();
  // @cpt-begin:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2:inst-show-last-ping
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const lastPing = typeof search[LAST_PING_PARAM] === 'string' ? (search[LAST_PING_PARAM] as string) : null;
  // @cpt-end:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2:inst-show-last-ping

  // @cpt-begin:cpt-template-mfe-demo-flow-widget-fixtures-open-isolation:p2:inst-send-mount
  // Dispatch is acceptance-only: it returns void and never throws, so
  // there is nothing to await or catch here.
  const handleMountHelloWorld = React.useCallback(() => {
    bridge.executeActionsChain({
      action: {
        type: FRONTX_ACTION_MOUNT_EXT,
        target: FRONTX_SCREEN_DOMAIN,
        payload: { subject: HELLOWORLD_EXTENSION_ID },
      },
    });
  }, [bridge]);
  // @cpt-end:cpt-template-mfe-demo-flow-widget-fixtures-open-isolation:p2:inst-send-mount

  return (
    <>
      <ItemContent>
        <ItemTitle>
          Widget A instance: <span data-testid="widget-a-random">{randomHex}</span>
        </ItemTitle>
        {/* The instance id has no break opportunity; the description list wraps it anywhere instead of clipping it. */}
        <DescriptionList orientation="horizontal" size="sm">
          <DescriptionItem>
            <DescriptionTerm>instance-id</DescriptionTerm>
            <DescriptionDetails variant="mono">{bridge.extensionId}</DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>last ping</DescriptionTerm>
            <DescriptionDetails data-testid="widget-a-last-ping" data-last-ping={lastPing ?? ''}>
              {lastPing ?? '-'}
            </DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>
      </ItemContent>
      <ItemFooter>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="widget-a-mount-helloworld"
          onClick={handleMountHelloWorld}
        >
          Mount Hello World (shell, 2 hops up)
        </Button>
      </ItemFooter>
    </>
  );
}
// @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-routes:p2:inst-home-page

// @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-routes:p2:inst-not-found
function WidgetANotFound(): React.ReactElement {
  return (
    <ItemContent>
      <ItemDescription data-testid="widget-a-not-found">widget-a has no such page</ItemDescription>
    </ItemContent>
  );
}
// @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-routes:p2:inst-not-found

// @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-routes:p2:inst-route-tree
const rootRoute = createRootRoute({ component: WidgetARoot, notFoundComponent: WidgetANotFound });

/** The widget's routes inside its entry: `/` shows the instance; any other path renders the widget's not-found page. */
export const widgetARouteTree: AnyRoute = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: '/', component: WidgetAHome }),
]);
// @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-routes:p2:inst-route-tree

