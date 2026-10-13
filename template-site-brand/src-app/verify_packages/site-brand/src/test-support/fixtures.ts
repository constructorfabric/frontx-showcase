// A small kit stylesheet and a brand record that satisfy every rule of the brand check; each negative test breaks one copy of them.

export const KIT_CSS = `/* A kit comment with braces: body { background: x } */
:root {
  --radius: 10px;
}
:root,
[data-theme='light'] {
  --background: #f1f5f9;
  --foreground: #0f172a;
  --primary: #0065e3;
  --primary-hover: #2668c5;
  --primary-foreground: #fff;
  --secondary: #eef2f7;
  --muted: #f1f5f9;
  --muted-foreground: #334155;
  color-scheme: light;
}
[data-theme='dark'] {
  --background: #0f172a;
  --foreground: #ffffff;
  --primary: #0065e3;
  --primary-hover: #2668c5;
  --primary-foreground: #ffffff;
  --secondary: #0f172a;
  --muted: #0f172a;
  --muted-foreground: #94a3b8;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --background: #0f172a;
  }
}
`;

export function goodBrandJson(): Record<string, unknown> {
  return {
    light: {
      appearance: 'light',
      overrides: [
        { token: '--primary', value: '#0756f5', v2: '#0756f5', role: 'Brand blue' },
        { token: '--primary-hover', value: 'color-mix(in oklab, var(--primary) 80%, var(--foreground))', v2: '#2668c5', reason: 'Derived from the brand blue', role: 'Hover of the brand blue' },
        { token: '--primary-foreground', value: '#ffffff', v2: '#fff', role: 'Text on the brand blue' },
        { token: '--background', value: '#ffffff', v2: '#ffffff', role: 'Page background' },
        { token: '--foreground', value: '#152440', v2: '#152440', role: 'Ink' },
        { token: '--secondary', value: null, v2: '#edf1f8', reason: 'Not adopted', role: 'Secondary surface' },
      ],
      tokens: [{ token: '--site-nav-foreground', value: '#283349', v2: '#283349', role: 'Header links' }],
    },
    dark: {
      appearance: 'dark',
      tokens: [{ token: '--site-nav-foreground', value: 'var(--foreground)', v2: null, reason: 'V2 has no dark site theme', role: 'Header links, dark' }],
    },
    invariant: [
      { token: '--site-weight-title', type: 'number', value: '560', v2: '560', role: 'Title weight' },
      { token: '--site-text-hero-size', type: 'length', value: 'clamp(2.625rem, 4.55vw, 4.625rem)', v2: 'clamp(42px, 4.55vw, 74px)', role: 'Hero size' },
      { token: '--site-night', type: 'color', value: '#10234b', v2: '#10234b', role: 'Night band' },
    ],
    pairs: {
      light: [
        ['--primary', '--primary-foreground'],
        ['--primary-hover', '--primary-foreground'],
        ['--background', '--site-nav-foreground'],
        ['--muted', '--muted-foreground'],
      ],
      dark: [['--background', '--site-nav-foreground']],
    },
    head: {
      themeColor: { value: '#2852ed', v2: '#2852ed', role: 'Browser chrome colour' },
      backgroundColor: { value: '#ffffff', v2: '#ffffff', role: 'Splash background' },
    },
  };
}

export const GOOD_SOURCES = [
  { path: 'shell/Header.module.css', text: '.nav { color: var(--site-nav-foreground); font-weight: var(--site-weight-title); }\n' },
  { path: 'site/Hero.module.css', text: '.hero { font-size: var(--site-text-hero-size); }\n.band { background: var(--site-night); }\n' },
  { path: 'site/Frame.tsx', text: "export const frame = { color: 'var(--primary)' };\n" },
];

export const GOOD_CONFIG = { siteName: 'Example', themeColor: '#2852ed', backgroundColor: '#ffffff' };
