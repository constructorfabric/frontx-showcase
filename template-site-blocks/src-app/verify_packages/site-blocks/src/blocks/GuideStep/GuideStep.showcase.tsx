import { Card, CardContent } from '@gears-frontx/ui-kit';
import { Link, Text } from '@gears-frontx/kit-candidates';

import { GuideStep } from './GuideStep';

export const showcase = { title: 'Guide step', group: 'docs', summary: 'A numbered step of a guide: number marker apart from the title, lead, command with Copy, files, result drawing, expected result, note and links.' } as const;

export default function GuideStepShowcase() {
  return (
    <>
      <GuideStep
        id="workspace"
        number={1}
        title="Create a clean workspace"
        lead="Run these steps in the same terminal. Keep the template inventory local to this workspace; an existing project is not required."
        code={{ title: 'Workspace', code: 'mkdir frontx-start && cd frontx-start\nexport FRONTX_INVENTORY_ROOT="$PWD/.frontx-inventory"' }}
        expected={{ label: 'Expected result:', text: 'A new workspace with its own template inventory. No global CLI installation.' }}
        copyLabel="Copy"
        copiedLabel="Copied"
      />
      <GuideStep
        id="find"
        number={2}
        title="Find the screen"
        lead="Blank Home belongs to _blank-mfe. You are changing an included example, not creating a new microfrontend."
        files={[
          { path: 'src-app/mfe_packages/_blank-mfe/src/screens/home/HomeScreen.tsx', name: <Link href="#home-screen">HomeScreen.tsx</Link>, text: 'Screen layout, UI Kit components and bridge subscriptions.' },
          { path: 'src-app/mfe_packages/_blank-mfe/src/screens/home/i18n/en.json', name: <Link href="#en-json">i18n/en.json</Link>, text: 'English text for this screen. This is the file you will edit.' },
          { path: 'src-app/mfe_packages/_blank-mfe/mfe.json', name: 'mfe.json', text: 'Module registration and the Blank Home menu entry. Leave it unchanged.' },
        ]}
        copyLabel="Copy"
        copiedLabel="Copied"
      />
      <GuideStep
        id="open"
        number={3}
        title="Open Blank Home"
        lead="Open http://localhost:5173 and choose Blank Home. The screen should show the title and description below."
        result={
          // A placeholder for the result drawing, a brand art component.
          <Card size="sm">
            <CardContent>
              <Text tone="muted">Result drawing</Text>
            </CardContent>
          </Card>
        }
        note={{ title: 'Choose Hello World in the menu', items: ['You should see "Hello World from MFE". Choose Blank Home to load a different module.', 'Uses localhost ports 5173, 3001, 3099, 3201 and 3202.'] }}
        links={<Link href="#limits">Quickstart verification and limits</Link>}
        copyLabel="Copy"
        copiedLabel="Copied"
      />
    </>
  );
}
