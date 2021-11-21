import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import {
  readBundleDescriptor,
  bundleTimestamp,
} from '../../lib/descriptor';
import {
  lockfileTimestamp,
  readLockfile,
  lockfileExists,
  rebuildLockfile,
} from '../../lib/lockfile';
import { unpackBundleInto } from '../../lib/repository';

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

const sync = (options) => ensureLockfileExists(options.bundle, options.lockfile)
  .then(() => {
    rimraf.sync('bundles');
    mkdirp.sync('bundles');
  })
  .then(() => readLockfile(options.lockfile))
  .then(loadAllBundles)
  .catch((e) => {
    console.log(`Error: ${e}`); // eslint-disable-line no-console
  });

export default sync;
