import { describe, expect, it } from 'vitest';
import { offeredLanguages } from './site';

const supported = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ar', name: 'Arabic' },
];

describe('offeredLanguages', () => {
  it('offers the supported languages the site ships, in the site order, and drops a code the framework cannot switch to', () => {
    expect(offeredLanguages(supported, ['de', 'xx', 'en']).map((language) => language.code)).toEqual(['de', 'en']);
    expect(offeredLanguages(supported, ['en'])).toHaveLength(1);
  });
});
