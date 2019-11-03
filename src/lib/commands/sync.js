import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import {
  readBundleDescriptor,
  bundleTimestamp,
} from '../descriptor';
import {
  lockfileTimestamp,
  readLockfile,
  lockfileExists,
  rebuildLockfile,
} from '../lockfile';
import { unpackBundleInto } from '../repository';

const fetchAndUnpackBundle = ({ name, version }) => {
  mkdirp.sync(`bundles/${name}`);
  return unpackBundleInto(name, version, `bundles/${name}`);
};

const loadAllBundles = (lockfile) => Promise.all(lockfile.map(fetchAndUnpackBundle));

const ensureLockfileExists = async (bundle, lockfile) => {
  if (lockfileExists(lockfile)) {
    if (bundleTimestamp(bundle) > lockfileTimestamp(lockfile)) {
      await rebuildLockfile(lockfile, readBundleDescriptor(bundle));
    }
  } else {
    await rebuildLockfile(lockfile, readBundleDescriptor(bundle));
  }
};

const sync = (options) => {
  return ensureLockfileExists(options.bundle, options.lockfile)
    .then(() => {
      rimraf.sync('bundles');
      mkdirp.sync('bundles');
    })
    .then(() => readLockfile(options.lockfile))
    .then(loadAllBundles)
    .catch(e => {
      console.log('Here?');
      console.log(`Error: ${e}`);
    });
};

export default sync;
