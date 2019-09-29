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

const sync = async options => {
  if (lockfileExists(options.lockfile)) {
    console.log('Lockfile exists...');
    if (bundleTimestamp(options.bundle) > lockfileTimestamp(options.lockfile)) {
      console.log('Bundle updated - rebuilding lockfile...');
      await rebuildLockfile(options.lockfile, readBundleDescriptor(options.bundle));
    }
  } else {
    console.log('No lockfile - rebuilding...');
    await rebuildLockfile(options.lockfile, readBundleDescriptor(options.bundle));
  }
  rimraf.sync('bundles');
  mkdirp.sync('bundles');
  await loadAllBundles(await readLockfile(options.lockfile));
};

export default sync;
