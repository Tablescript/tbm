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

const parseDependency = async (name, version) => {
  throwIfEmpty('No name', name);
  return [name, version || await getLatestVersionFor(name)];
};

const add = async (name, version, options) => {
  R.compose(
    writeBundleDescriptor(options.bundle),
    addBundleDependency(...(await parseDependency(name, version))),
  )(readBundleDescriptor(options.bundle));

  await sync(options);
};

export default add;
