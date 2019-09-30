import {
  readBundleDescriptor,
  bundleTimestamp
} from '../descriptor';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import {
  lockfileTimestamp,
  readLockfile,
  lockfileExists,
  rebuildLockfile,
} from '../lockfile';
import { unpackBundleInto } from '../repository';

const fetchAndUnpackBundle = (name, version) => {
  mkdirp.sync(`bundles/${name}`);
  unpackBundleInto(name, version, `bundles/${name}`);
};

const loadAllBundles = async lockfile => {
  await Promise.all(lockfile.map(dependency => {
    fetchAndUnpackBundle(dependency.name, dependency.version);
  }));
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

const sync = async options => {
  await ensureLockfileExists(options.bundle, options.lockfile);
  rimraf.sync('bundles');
  mkdirp.sync('bundles');
  await loadAllBundles(await readLockfile(options.lockfile));
};

export default sync;
