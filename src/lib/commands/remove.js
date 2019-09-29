import * as R from 'ramda';
import {
  readBundleDescriptor,
  removeBundleDependency,
  writeBundleDescriptor,
} from '../descriptor';
import sync from './sync';

const remove = async (name, options) => {
  R.compose(
    writeBundleDescriptor(options.bundle),
    removeBundleDependency(name),
  )(readBundleDescriptor(options.bundle));

  await sync(options);
};

export default remove;
