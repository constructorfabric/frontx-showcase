import { Card, CardContent, CardHeader } from '@gears-frontx/ui-kit';
import { CardTitle, Link, Text } from '@gears-frontx/kit-candidates';
import { createElement } from 'react';

import { FileExplorer, type ExplorerFile } from './FileExplorer';

export const showcase = { title: 'File explorer', group: 'docs', summary: "A template's key files: Files and Example tabs, the source line, the file rail with a find box, and the viewer headed by the chosen file's description." } as const;

const manifest = ['{', '  "schemaVersion": "1.0",', '  "name": "@gears-frontx/frontx-template-shell",', '  "version": "0.3.0",', '  "ownershipBoundaries": {', '    "exclusiveSubtrees": ["src-app/app/"],', '    "sharedFiles": []', '  }', '}'].join('\n');
const main = ["import { createRoot } from 'react-dom/client';", "import { App } from '@/app';", '', "createRoot(document.getElementById('root')!).render(<App />);"].join('\n');

const files: ExplorerFile[] = [
  { path: 'frontx-template.json', description: 'Template identity and ownership', url: 'https://example.org/frontx-template.json', lines: 9, content: manifest },
  { path: 'src-app/app/main.tsx', description: 'Application entry', url: 'https://example.org/main.tsx', lines: 4, content: main },
  { path: 'src-app/app/App.tsx', description: 'Layout and screen slot', lines: 1, content: 'export function App() { return null; }' },
  { path: 'src-app/app/mfe/bootstrap.ts', description: 'Microfrontend registration', lines: 1, content: 'export const bootstrap = () => undefined;' },
  { path: 'vite.config.ts', description: 'Build and development server', lines: 1, content: 'export default {};' },
];

export default function FileExplorerShowcase() {
  return (
    <FileExplorer
      id="key-files"
      title="Key files"
      files={files}
      labels={{ copy: 'Copy', copied: 'Copied', lines: 'lines', files: 'Files', example: 'Example', keyFiles: 'Key files', findFile: 'Find a file', noFiles: 'No key file matches.', github: 'GitHub', templateRoot: 'Template root' }}
      source={{ label: 'Source', value: '3b6cddb2' }}
      note="Unmodified source"
      scope={
        <>
          <span>Selected original files.</span>
          <Link href="#repository">Full repository</Link>
        </>
      }
      legal={
        <>
          <Link href="#license" variant="muted">
            Apache-2.0
          </Link>
          <Link href="#notice" variant="muted">
            Notice
          </Link>
        </>
      }
      example={
        <Card>
          <CardHeader>
            <CardTitle render={createElement('h3')}>Shell example</CardTitle>
          </CardHeader>
          <CardContent>
            <Text tone="muted">The live example of this template, with the screens it contains.</Text>
          </CardContent>
        </Card>
      }
    />
  );
}
