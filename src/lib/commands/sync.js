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

const fetchAndUnpackBundle = async ({ name, version }) => {
  mkdirp.sync(`bundles/${name}`);
  await unpackBundleInto(name, version, `bundles/${name}`);
};

const loadAllBundles = async (lockfile) => {
  await Promise.all(lockfile.map(fetchAndUnpackBundle));
};

const ensureLockfileExists = async (bundle, lockfile) => {
  if (lockfileExists(lockfile)) {
    if (bundleTimestamp(bundle) > lockfileTimestamp(lockfile)) {
      await rebuildLockfile(lockfile, readBundleDescriptor(bundle));
    }
  } else {
    await rebuildLockfile(lockfile, readBundleDescriptor(bundle));
  }
};

const sync = async (options) => {
  await ensureLockfileExists(options.bundle, options.lockfile);
  rimraf.sync('bundles');
  mkdirp.sync('bundles');
  await loadAllBundles(await readLockfile(options.lockfile));
};

export default sync;
