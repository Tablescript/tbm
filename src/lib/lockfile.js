import * as R from 'ramda';
import fs from 'fs';
import semver from 'semver';
import { loadManifestFor, loadBundleFor } from './repository';

const DEFAULT_LOCKFILE = 'bundle.lock';

export const lockfileTimestamp = (filename) => {
  return fs.statSync(filename).mtime;
};

export const lockfileExists = (filename) => {
  return fs.existsSync(filename);
};

export const readLockfile = (filename) => {
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
};

const writeLockfile = R.curry((filename, contents) => {
  fs.writeFileSync(filename, JSON.stringify(contents, null, 2) + "\n");
});


const mergeDependency = R.curry((bundleName, name, version, tree) => ({
  ...tree,
  [name]: {
    ...(tree[name] || {}),
    requested: [
      ...(tree[name] ? tree[name].requested : []),
      {
        name: bundleName,
        version,
      },
    ]
  },
}));

const mergeSubdependencies = R.curry((name, version, tree) => mergeBundleDependencies(loadBundleFor(name, version), tree));

const mergeBundleDependency = R.curry((bundleName, tree, [name, versionRange]) => {
  const resolvedVersion = semver.maxSatisfying(loadManifestFor(name).versions, versionRange);

  return R.compose(
    mergeSubdependencies(name, resolvedVersion),
    mergeDependency(bundleName, name, versionRange),
  )(tree);
});

const mergeBundleDependencies = (bundle, tree = {}) => R.toPairs(bundle.dependencies).reduce(mergeBundleDependency(bundle.name), tree);

const resolveBundleDependencies = (requested) => {

  const requestedVersions = R.compose(
    R.join(' '),
    R.map(R.prop('version')),
  );

  const toResolved = ([name, details]) => ({
    name,
    ...details,
    version: semver.maxSatisfying(loadManifestFor(name).versions, requestedVersions(details.requested)),
  });

  return R.compose(
    R.sortBy(R.prop('name')),
    R.map(toResolved),
    R.toPairs,
  )(requested);
};

export const rebuildLockfile = R.curry((filename, bundle) => R.compose(
  writeLockfile(filename),
  resolveBundleDependencies,
  mergeBundleDependencies,
)(bundle));
