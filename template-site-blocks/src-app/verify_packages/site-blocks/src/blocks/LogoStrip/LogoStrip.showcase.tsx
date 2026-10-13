import { createElement } from 'react';
import { LogoStrip } from './LogoStrip';

/** A placeholder mark: a rounded grey bar standing in for a company's logo file. */
const mark = (width: number, height: number) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" rx="${height / 2}" fill="gray"/></svg>`)}`;

export const showcase = { title: 'Logo strip', group: 'section', summary: 'The teams that use the product: a centred title over a row of company logos in their own colours, each a link to the company.', fullBleed: true } as const;

export default function LogoStripShowcase() {
  return (
    <LogoStrip
      id="showcase-logo-strip"
      title="Teams using the product"
      logos={[
        { name: 'Example One', image: mark(118, 24), width: 118, height: 24, link: createElement('a', { href: 'https://example.com/one' }) },
        { name: 'Example Two', image: mark(128, 23), width: 128, height: 23, link: createElement('a', { href: 'https://example.com/two' }) },
        { name: 'Example Three', image: mark(194, 13), width: 194, height: 13, link: createElement('a', { href: 'https://example.com/three' }) },
        { name: 'Example Four', image: mark(108, 25), width: 108, height: 25, link: createElement('a', { href: 'https://example.com/four' }) },
      ]}
    />
  );
}
