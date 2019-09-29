import axios from 'axios';
import * as R from 'ramda';

const buildBundle = (version, dependencies = {}) => ({
  version,
  dependencies,
});

const buildBundles = (name, bundleDefs) => ({
  [name]: {
    manifest: {
      name,
      latest: bundleDefs[bundleDefs.length - 1].version,
      versions: bundleDefs.map(def => def.version),
    },
    versions: {
      ...bundleDefs.reduce((acc, bundleDef) => ({
        ...acc,
        [bundleDef.version]: {
          name,
          ...bundleDef,
        },
      }), {}),
    },
  },
});

const repo = {
  ...buildBundles(
    'dnd4e',
    [
      buildBundle('1.0.0', { a: '^1.0.0', b: '^1.0.0' }),
      buildBundle('1.0.1', { a: '^1.0.1', b: '^1.0.0' }),
      buildBundle('1.0.2', { a: '^1.0.1', b: '^1.0.0' }),
    ],
  ),
  ...buildBundles(
    'a',
    [
      buildBundle('1.0.0', { c: '^1.0.0' }),
      buildBundle('1.0.1', { c: '^1.0.1' }),
      buildBundle('1.0.2', { c: '^1.0.1' }),
      buildBundle('1.1.0', { c: '^1.0.1' }),
      buildBundle('2.0.0', { c: '^1.0.1' }),
    ],
  ),
  ...buildBundles(
    'b',
    [
      buildBundle('1.0.0', { c: '^1.0.0' }),
    ],
  ),
  ...buildBundles(
    'c',
    [
      buildBundle('1.0.0', {}),
      buildBundle('1.0.1', {}),
    ],
  ),
  ...buildBundles(
    'classes',
    [
      buildBundle('1.0.0', { stuff: '^1.0.0' }),
    ],
  ),
  ...buildBundles(
    'stuff',
    [
      buildBundle('1.0.0', {}),
    ],
  ),
};

export const loadManifestFor = async dep => {
  console.log(`Fetching bundle manifest for ${dep}...`);
  return axios.get(`http://localhost:8080/api/v1/bundles/${dep}/manifest`)
    .then(R.prop('data'));
};

export const loadBundleDescriptorFor = async (dep, version) => {
  console.log(`Fetching bundle descriptor for ${dep}@${version}...`);
  return axios.get(`http://localhost:8080/api/v1/bundles/${dep}/releases/${version}`)
    .then(R.prop('data'));
};

export const getLatestVersionFor = async dep => {
  const manifest = await loadManifestFor(dep);
  return manifest.latest;
};
