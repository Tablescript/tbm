import * as R from 'ramda';
import {
  readBundleDescriptor,
  writeBundleDescriptor,
  addBundleDependency,
} from '../../lib/descriptor';
import { getLatestVersionFor } from '../../lib/repository';
import sync from './sync';

const throwIfEmpty = R.curry((message, s) => {
  if (R.isEmpty(s)) {
    throw new Error(message);
  }
});

const parseDependency = async (name, version) => {
  throwIfEmpty('No name', name);
  return [name, version || await getLatestVersionFor(name)];
};

const add = (name, version, options) => {
  const bundleDescriptor = readBundleDescriptor(options.bundle);
  return parseDependency(name, version)
    .then(([dependencyName, dependencyVersion]) => addBundleDependency(dependencyName, dependencyVersion, bundleDescriptor))
    .then(writeBundleDescriptor(options.bundle))
    .then(() => sync(options))
    .catch((e) => {
      console.log(`Error: ${e}`); // eslint-disable-line no-console
    });
};

export default add;
