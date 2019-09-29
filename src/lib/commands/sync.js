import {
  readBundleDescriptor,
  bundleDependencies,
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

const fetchAndUnpackBundle = name => {
  console.log(`fetching and unpacking ${name}...`);
  mkdirp.sync(`bundles/${name}`);
  
};

const loadBundle = (name, version) => {
  mkdirp.sync(`bundles/${name}`);
  fetchAndUnpackBundle(name, version);
};

const loadAllBundles = lockfile => {
  lockfile.forEach(dependency => {
    loadBundle(dependency.name, dependency.version);
  });
};

const sync = async options => {
  if (lockfileExists(options.lockfile)) {
    if (bundleTimestamp(options.lockfile) > lockfileTimestamp(options.lockfile)) {
      console.log('Bundle updated - rebuilding lockfile...');
      await rebuildLockfile(options.lockfile, readBundleDescriptor(options.bundle));
    }
  } else {
    console.log('No lockfile - rebuilding...');
    await rebuildLockfile(options.lockfile, readBundleDescriptor(options.bundle));
  }
  rimraf.sync('bundles');
  mkdirp.sync('bundles');
  loadAllBundles(await readLockfile(options.lockfile));
};

export default sync;
