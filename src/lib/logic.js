import * as R from 'ramda';
import semver from 'semver';
import { loadManifestFor, loadBundleFor, getLatestVersionFor } from './repository';

const makeSemVer = version => `^${version}`;

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

const bundleDescriptor = {
  name: 'myScript',
  dependencies: {},
};


const addDependency = R.curry((name, version, descriptor) => ({
  ...descriptor,
  dependencies: {
    ...descriptor.dependencies,
    [name]: version,
  },
}));

//console.log(JSON.stringify(repo));
const updatedBundleDescriptor = R.pipe(
  addDependency('dnd4e', makeSemVer(getLatestVersionFor('dnd4e'))),
  addDependency('c', '^1.0.1'),
 )(bundleDescriptor);

//console.log(JSON.stringify(updatedBundleDescriptor));

const requested = mergeBundleDependencies(updatedBundleDescriptor);
//console.log(JSON.stringify(requested));

const requestedVersions = R.compose(
  R.join(' '),
  R.map(R.prop('version')),
);

const toResolved = ([name, details]) => ({
  name,
  ...details,
  version: semver.maxSatisfying(loadManifestFor(name).versions, requestedVersions(details.requested)),
});

const resolved = R.compose(
  R.sortBy(R.prop('name')),
  R.map(toResolved),
  R.toPairs,
)(requested);

console.log(JSON.stringify(resolved));
