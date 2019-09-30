import * as R from 'ramda';
import fs from 'fs';
import semver from 'semver';
import { loadManifestFor, loadBundleDescriptorFor } from './repository';

export const lockfileTimestamp = filename => fs.statSync(filename).mtime;

export const lockfileExists = filename => fs.existsSync(filename);

export const readLockfile = filename => JSON.parse(fs.readFileSync(filename, 'utf8'));

const writeLockfile = R.curry((filename, contents) => {
  fs.writeFileSync(filename, `${JSON.stringify(contents, null, 2)}\n`);
});


const mergeDependency = (bundleName, name, version, tree) => ({
  ...tree,
  [name]: {
    ...(tree[name] || {}),
    requested: [
      ...(tree[name] ? tree[name].requested : []),
      {
        name: bundleName,
        version,
      },
    ],
  },
});

const mergeSubdependencies = async (name, version, tree) => {
  const bundle = await loadBundleDescriptorFor(name, version);
  return mergeBundleDependencies(bundle, tree);
};

const mergeBundleDependency = bundleName => async (p, [name, versionRange]) => {
  const tree = await p;
  const manifest = await loadManifestFor(name);
  const resolvedVersion = semver.maxSatisfying(manifest.versions, versionRange);

  return mergeSubdependencies(name, resolvedVersion, mergeDependency(bundleName, name, versionRange, tree));
};

const mergeBundleDependencies = async (bundle, tree = {}) => {
  const pairs = R.toPairs(bundle.dependencies);
  return pairs.reduce(mergeBundleDependency(bundle.name), Promise.resolve(tree));
};

const requestedVersions = R.compose(
  R.join(' '),
  R.map(R.prop('version')),
);

const resolveVersion = async (name, details) => {
  const manifest = await loadManifestFor(name);
  return semver.maxSatisfying(manifest.versions, requestedVersions(details.requested));
};

const toResolved = async ([name, details]) => ({
  name,
  ...details,
  version: await resolveVersion(name, details),
});

const asyncMap = (f, arr) => arr.reduce(async (p, v, i) => ([
  ...(await p),
  await f(v, i),
]), []);

const resolveBundleDependencies = async requested => R.compose(
  R.sortBy(R.prop('name')),
)(await asyncMap(toResolved, R.toPairs(requested)));

export const rebuildLockfile = async (filename, bundle) => {
  const merged = await mergeBundleDependencies(bundle);
  const resolved = await resolveBundleDependencies(merged);
  writeLockfile(filename, resolved);
};
