import manifest from '../mfe.json';
import pkg from '../package.json';
import viteConfig from '../vite.config.ts?raw';
import { describeScreenManifest } from '@inbox-shared/test-support/describeScreenManifest';
import { mailRouteTree } from './routes';

describeScreenManifest({ manifest, preview: pkg.scripts.preview, token: 'inbox-mail', order: 64, viteConfig, routeTree: mailRouteTree });
