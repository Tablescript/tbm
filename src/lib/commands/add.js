import * as R from 'ramda';
import {
  readBundleDescriptor,
  writeBundleDescriptor,
  addBundleDependency,
} from '../descriptor';
import { getLatestVersionFor } from '../repository';
import sync from './sync';

const throwIfEmpty = R.curry((message, s) => {
  if (R.isEmpty(s)) {
    throw new Error(message);
  }
});

const parseDependency = (name, version) => {
  throwIfEmpty('No name', name);
  return [name, version || getLatestVersionFor(name)];
};

const add = (name, version, options) => {
  R.compose(
    writeBundleDescriptor(options.bundle),
    addBundleDependency(...parseDependency(name, version)),
  )(readBundleDescriptor(options.bundle));

  sync(options);
};

export default add;
