import * as R from 'ramda';
import {
  readBundleDescriptor,
  removeBundleDependency,
  writeBundleDescriptor,
} from '../descriptor';
import sync from './sync';

const remove = (name, options) => {
  R.compose(
    writeBundleDescriptor(options.bundle),
    removeBundleDependency(name),
  )(readBundleDescriptor(options.bundle));

  sync(options);
};

export default remove;
