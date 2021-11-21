import * as R from 'ramda';
import fs from 'fs';

export const defaultBundleDescriptor = (name) => ({
  name,
  description: '',
  version: '1.0.0',
  main: 'main.ts',
  author: '',
  email: '',
  url: '',
  license: '',
});

export const bundleDescriptorExists = (filename) => fs.existsSync(filename);

export const writeBundleDescriptor = R.curry((filename, bundle) => {
  fs.writeFileSync(filename, `${JSON.stringify(bundle, null, 2)}\n`);
});

export const readBundleDescriptor = (filename) => JSON.parse(fs.readFileSync(filename, 'utf8'));

export const bundleTimestamp = (filename) => fs.statSync(filename).mtime;

export const addBundleDependency = R.curry((name, version, bundle) => ({
  ...bundle,
  dependencies: {
    ...bundle.dependencies,
    [name]: version,
  },
}));

export const removeBundleDependency = R.curry((name, bundle) => ({
  ...bundle,
  dependencies: {
    ...bundle.dependencies,
    [name]: undefined,
  },
}));

export const bundleDependencies = (bundle) => bundle.dependencies || {};

export const bundleHasDependency = (bundle, name) => Boolean(bundleDependencies(bundle)[name]);

export const bundleDependencyNames = (bundle) => Object.keys(bundleDependencies(bundle));

export const bundleMainScript = (bundle) => bundle.main;
export const bundleHasMainScript = (bundle) => Boolean(bundleMainScript(bundle));
