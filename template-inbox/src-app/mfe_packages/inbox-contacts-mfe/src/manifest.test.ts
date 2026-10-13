import manifest from '../mfe.json';
import pkg from '../package.json';
import viteConfig from '../vite.config.ts?raw';
import { describeScreenManifest } from '@inbox-shared/test-support/describeScreenManifest';
import { contactsRouteTree } from './routes';

describeScreenManifest({ manifest, preview: pkg.scripts.preview, token: 'inbox-contacts', order: 61, viteConfig, routeTree: contactsRouteTree });
