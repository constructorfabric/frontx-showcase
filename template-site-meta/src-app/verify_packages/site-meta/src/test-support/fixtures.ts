import { buildPageMap, type ScreenExtension, type SiteConfig } from '../site.ts';

export const CONFIG: SiteConfig = {
  siteName: 'FrontX',
  titleTemplate: '%s - FrontX',
  defaultDescription: 'FrontX is a framework for building frontends from microfrontends, templates and a shared UI kit.',
  locale: 'en',
  homeScreen: 'home',
  twitterCard: 'summary',
};

export const ORIGIN = 'http://localhost:4173';

const describe = (what: string) => `${what}: a description long enough to hold the fifty character minimum.`;

export const EXTENSIONS: ScreenExtension[] = [
  {
    id: 'ext.catalogue',
    route: '/catalogue',
    packageName: 'catalogue-mfe',
    presentation: { label: 'UI Kit', order: 20 },
    seo: {
      title: 'UI Kit',
      description: describe('Catalogue'),
      routes: {
        '/components/button': { title: 'Button', description: describe('Button') },
        '/components/card': { title: 'Card', description: describe('Card') },
        '/foundations/typography': { title: 'Typography', description: describe('Typography') },
      },
    },
  },
  {
    id: 'ext.home',
    route: '/home',
    packageName: 'site-home-mfe',
    presentation: { label: 'Home', order: 10 },
    seo: { title: 'Home', description: describe('Home') },
  },
  {
    id: 'ext.contacts',
    route: '/inbox-contacts',
    packageName: 'inbox-contacts-mfe',
    presentation: { label: 'Contacts', order: 41 },
    seo: {
      title: 'Contacts',
      description: describe('Contacts'),
      routes: { '/$contactId': { title: 'Contact', description: describe('Contact'), indexable: false } },
    },
  },
];

export const MAP = buildPageMap(CONFIG, ORIGIN, 'screen', EXTENSIONS);
