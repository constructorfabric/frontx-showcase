import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkPackagePins, expectedPins, runPolicyPins } from './policy-pins.mjs';

let root;

function write(relative, value) {
  const file = path.join(root, relative);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value));
}

const SITE = {
  name: '@gears-frontx/frontx-template-shell',
  version: '0.1.0-alpha.5',
  dependencies: { '@gears-frontx/ui-kit': '0.4.0', '@gears-frontx/routing': '0.3.0', react: '19.2.4', 'lucide-react': '0.563.0' },
  peerDependencies: { '@gears-frontx/mfes': '*' },
  devDependencies: { vite: '6.4.3' },
};

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'policy-pins-'));
  write('site/package.json', SITE);
  write('site/package-lock.json', { packages: { 'node_modules/@gears-frontx/ui-kit': { version: '0.4.0', dependencies: { 'lucide-react': '1.33.0' } } } });
  write('site/packages/react/package.json', { name: '@gears-frontx/react', version: '0.2.0-alpha.10' });
  write('template-demo/frontx-template.json', { name: '@gears-frontx/frontx-template-demo' });
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

const versions = (pins) => Object.fromEntries([...pins].map(([name, pin]) => [name, pin.version]));

describe('expectedPins', () => {
  it('takes the site application\'s registry ecosystem dependencies, the shell and its workspaces, the shell toolchain and the kit own dependencies from the lock file', () => {
    const { pins, errors } = expectedPins(root);
    expect(errors).toEqual([]);
    expect(versions(pins)).toEqual({
      '@gears-frontx/ui-kit': '0.4.0',
      '@gears-frontx/routing': '0.3.0',
      '@gears-frontx/frontx-template-shell': '0.1.0-alpha.5',
      '@gears-frontx/react': '0.2.0-alpha.10',
      react: '19.2.4',
      vite: '6.4.3',
      'lucide-react': '1.33.0',
    });
  });

  it('refuses a range or a file: spec for an ecosystem package of the site, and a lock file that resolves another kit', () => {
    write('site/package.json', { ...SITE, dependencies: { ...SITE.dependencies, '@gears-frontx/routing': '^0.3.0', '@gears-frontx/mfes': 'file:../somewhere/mfes.tgz' } });
    write('site/package-lock.json', { packages: { 'node_modules/@gears-frontx/ui-kit': { version: '0.4.0-alpha.6' } } });
    const { pins, errors } = expectedPins(root);
    expect(errors).toEqual([
      'site/package.json: dependencies.@gears-frontx/routing is "^0.3.0"; the ecosystem is pinned to an exact registry version',
      'site/package.json: dependencies.@gears-frontx/mfes is "file:../somewhere/mfes.tgz"; the ecosystem is pinned to an exact registry version',
      'site/package-lock.json: does not resolve @gears-frontx/ui-kit to 0.4.0; run npm install --prefix site',
    ]);
    expect(pins.has('@gears-frontx/routing')).toBe(false);
  });
});

describe('expectedPins with packages the templates deliver', () => {
  beforeEach(() => {
    write('template-brand/frontx-template.json', { name: '@gears-frontx/frontx-template-brand' });
    write('template-brand/src-app/verify_packages/brand/package.json', { name: '@gears-frontx/brand', version: '0.1.0-alpha.0' });
    write('template-brand/src-app/mfe_packages/brand-mfe/package.json', { name: '@gears-frontx/brand-mfe', version: '0.2.0' });
    write('template-brand/src-app/verify_packages/local-tool/package.json', { name: 'local-tool', version: '1.0.0' });
  });

  it('pins a @gears-frontx/* package a template delivers under src-app/verify_packages/ at that package\'s own version, and no screen package or unscoped package', () => {
    const { pins, errors } = expectedPins(root);
    expect(errors).toEqual([]);
    expect(pins.get('@gears-frontx/brand')).toEqual({ version: '0.1.0-alpha.0', source: 'template-brand/src-app/verify_packages/brand/package.json' });
    expect(pins.has('@gears-frontx/brand-mfe')).toBe(false);
    expect(pins.has('local-tool')).toBe(false);
  });

  it('takes the template as the source when the site application depends on the package at the same version, and reports a different version there', () => {
    write('site/package.json', { ...SITE, dependencies: { ...SITE.dependencies, '@gears-frontx/brand': '0.1.0-alpha.0' } });
    expect(expectedPins(root)).toEqual(expect.objectContaining({ errors: [] }));
    expect(expectedPins(root).pins.get('@gears-frontx/brand')?.source).toBe('template-brand/src-app/verify_packages/brand/package.json');
    write('site/package.json', { ...SITE, dependencies: { ...SITE.dependencies, '@gears-frontx/brand': '0.0.9' } });
    expect(expectedPins(root).errors).toEqual(['site/package.json: dependencies.@gears-frontx/brand is "0.0.9"; the pin is "0.1.0-alpha.0" (template-brand/src-app/verify_packages/brand/package.json)']);
  });

  it('reports a delivered package that takes the name of the shell or of a shell workspace', () => {
    write('template-brand/src-app/verify_packages/react/package.json', { name: '@gears-frontx/react', version: '9.9.9' });
    write('template-brand/src-app/verify_packages/shell/package.json', { name: '@gears-frontx/frontx-template-shell', version: '9.9.9' });
    expect(expectedPins(root).errors).toEqual([
      'template-brand/src-app/verify_packages/react/package.json: @gears-frontx/react is a package of the shell; a template package takes a name of its own',
      'template-brand/src-app/verify_packages/shell/package.json: @gears-frontx/frontx-template-shell is a package of the shell; a template package takes a name of its own',
    ]);
  });

  it('holds a template package that depends on another template\'s package to that package\'s version', () => {
    write('template-blocks/frontx-template.json', { name: '@gears-frontx/frontx-template-blocks' });
    write('template-blocks/src-app/verify_packages/blocks/package.json', { name: '@gears-frontx/blocks', version: '0.1.0', peerDependencies: {}, dependencies: { '@gears-frontx/brand': '0.1.0' } });
    write('template-blocks/src-app/mfe_packages/blocks-mfe/package.json', { dependencies: { '@gears-frontx/brand': '0.1.0-alpha.0', '@gears-frontx/blocks': '0.1.0' } });
    expect(runPolicyPins(root)).toEqual({
      checked: 5,
      errors: ['template-blocks/src-app/verify_packages/blocks/package.json: dependencies.@gears-frontx/brand is "0.1.0"; the pin is "0.1.0-alpha.0" (template-brand/src-app/verify_packages/brand/package.json)'],
    });
  });
});

describe('checkPackagePins', () => {
  it('reports a pin that differs, a range, and an ecosystem package outside the set', () => {
    const { pins } = expectedPins(root);
    const errors = checkPackagePins(
      {
        dependencies: { '@gears-frontx/ui-kit': '0.4.0-alpha.6', react: '^19.2.4', '@gears-frontx/telemetry': '0.1.0', '@gears-frontx/mfes': '0.3.1', clsx: '^2.0.0' },
        devDependencies: { '@gears-frontx/react': '0.2.0-alpha.10' },
      },
      pins,
      'pkg/package.json'
    );
    expect(errors).toEqual([
      'pkg/package.json: dependencies.@gears-frontx/ui-kit is "0.4.0-alpha.6"; the pin is "0.4.0" (site/package.json)',
      'pkg/package.json: dependencies.react is "^19.2.4"; the pin is "19.2.4" (site/package.json)',
      'pkg/package.json: dependencies.@gears-frontx/telemetry is not an ecosystem package the site depends on, a shell workspace or a package a template of this repository delivers',
      'pkg/package.json: dependencies.@gears-frontx/mfes is not an ecosystem package the site depends on, a shell workspace or a package a template of this repository delivers',
    ]);
  });
});

describe('checkPackagePins with the site lock file', () => {
  const lock = {
    'node_modules/clsx': { version: '2.1.1' },
    'node_modules/react-day-picker': { version: '9.12.0' },
    'src-app/mfe_packages/a-mfe/node_modules/react-day-picker': { version: '10.0.1' },
  };

  it('requires every other dependency to be exact at the version the site lock resolves for the package, its own nested copy first', () => {
    const { pins } = expectedPins(root);
    const errors = checkPackagePins(
      {
        dependencies: { clsx: '^2.0.0', 'react-day-picker': '10.0.1' },
        devDependencies: { 'react-redux': '9.3.0', '@types/node': '2.1.1' },
      },
      pins,
      'pkg/package.json',
      { lock, lockPath: 'src-app/mfe_packages/a-mfe' }
    );
    expect(errors).toEqual([
      'pkg/package.json: dependencies.clsx is "^2.0.0"; the pin is "2.1.1" (site/package-lock.json)',
      'pkg/package.json: devDependencies.react-redux is not resolved by site/package-lock.json; run npm install --prefix site',
      'pkg/package.json: devDependencies.@types/node is not resolved by site/package-lock.json; run npm install --prefix site',
    ]);
  });

  it('reads the root copy when the package has no nested one', () => {
    const { pins } = expectedPins(root);
    expect(checkPackagePins({ dependencies: { 'react-day-picker': '10.0.1' } }, pins, 'pkg/package.json', { lock, lockPath: 'src-app/mfe_packages/b-mfe' })).toEqual([
      'pkg/package.json: dependencies.react-day-picker is "10.0.1"; the pin is "9.12.0" (site/package-lock.json)',
    ]);
  });
});

describe('runPolicyPins', () => {
  it('checks the third-party dependencies of a template package against the site lock file', () => {
    write('site/package-lock.json', {
      packages: {
        'node_modules/@gears-frontx/ui-kit': { version: '0.4.0', dependencies: { 'lucide-react': '1.33.0' } },
        'node_modules/react-redux': { version: '9.3.0' },
      },
    });
    write('template-demo/src-app/mfe_packages/a-mfe/package.json', { devDependencies: { 'react-redux': '^9.2.0' } });
    expect(runPolicyPins(root)).toEqual({ checked: 1, errors: ['template-demo/src-app/mfe_packages/a-mfe/package.json: devDependencies.react-redux is "^9.2.0"; the pin is "9.3.0" (site/package-lock.json)'] });
  });


  it('walks the tooling packages a template delivers under src-app/verify_packages/ too', () => {
    write('template-tool/frontx-template.json', { name: '@gears-frontx/frontx-template-tool' });
    write('template-tool/src-app/verify_packages/tool-check/package.json', { name: '@gears-frontx/tool-check', devDependencies: { react: '19.2.0', '@gears-frontx/routing': '0.3.0' } });
    expect(runPolicyPins(root)).toEqual({ checked: 1, errors: ['template-tool/src-app/verify_packages/tool-check/package.json: devDependencies.react is "19.2.0"; the pin is "19.2.4" (site/package.json)'] });
  });

  it('walks every MFE package of every template, skipping the shared folder, and reports the errors of the sources too', () => {
    write('template-demo/src-app/mfe_packages/a-mfe/package.json', { dependencies: { '@gears-frontx/react': '0.2.0-alpha.10' } });
    write('template-demo/src-app/mfe_packages/b-mfe/package.json', { dependencies: { '@gears-frontx/react': '0.2.0-alpha.9' } });
    write('template-demo/src-app/mfe_packages/shared/demo/package.json', { dependencies: { '@gears-frontx/react': 'x' } });
    expect(runPolicyPins(root)).toEqual({ checked: 2, errors: ['template-demo/src-app/mfe_packages/b-mfe/package.json: dependencies.@gears-frontx/react is "0.2.0-alpha.9"; the pin is "0.2.0-alpha.10" (site/packages/react/package.json)'] });
    write('site/package.json', { ...SITE, dependencies: { ...SITE.dependencies, '@gears-frontx/ui-kit': 'latest' } });
    expect(runPolicyPins(root).errors[0]).toBe('site/package.json: dependencies.@gears-frontx/ui-kit is "latest"; the ecosystem is pinned to an exact registry version');
  });
});
