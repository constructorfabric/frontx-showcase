import manifest from '../mfe.json';
import pkg from '../package.json';
import viteConfig from '../vite.config.ts?raw';
import { describeScreenManifest } from '@inbox-shared/test-support/describeScreenManifest';
import { chatRouteTree } from './routes';

describeScreenManifest({ manifest, preview: pkg.scripts.preview, token: 'inbox-chat', order: 63, viteConfig, routeTree: chatRouteTree });
