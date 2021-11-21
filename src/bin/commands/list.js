import * as R from 'ramda';
import {
  readBundleDescriptor,
  bundleDependencies,
} from '../../lib/descriptor';

const dumpAllDependencies = R.compose(
  console.log, // eslint-disable-line no-console
  R.join('\n'),
  R.map(([name, version]) => `${name}@${version}`),
  R.sortBy(R.head),
  R.toPairs,
  bundleDependencies,
);

const list = (options) => {
  dumpAllDependencies(readBundleDescriptor(options.bundle));
};

export default list;
