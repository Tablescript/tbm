import axios from 'axios';
import * as R from 'ramda';
import fs from 'fs';
import os from 'os';
import mkdirp from 'mkdirp';
import recursiveCopy from 'recursive-copy';

const cachePath = () => {
  const homeDir = os.homedir();
  return `${homeDir}/.tbm/cache`;
};

const initializeConfig = () => {
  mkdirp.sync(cachePath());
};  

const depVersion = (dep, version) => `${dep}@${version}`;

const manifestCache = {};
const descriptorCache = {};

const cacheManifest = async (dep, manifest) => {
  manifestCache[dep] = manifest;
};

const cacheBundleDescriptor = async (depVersion, bundleDescriptor) => {
  descriptorCache[depVersion] = bundleDescriptor;
};

const getCachedManifest = async dep => manifestCache[dep];

const getCachedBundleDescriptor = async depVersion => descriptorCache[depVersion];

export const loadManifestFor = async dep => {
  initializeConfig();
  const cachedManifest = await getCachedManifest(dep);
  if (cachedManifest) {
    console.log(`Using cached bundle manifest for ${dep}.`);
    return cachedManifest;
  }

  console.log(`Fetching bundle manifest for ${dep}...`);
  const freshManifest = await axios.get(`http://localhost:8080/api/v1/bundles/${dep}/manifest`)
    .then(R.prop('data'));

  console.log(`Caching bundle manifest for ${dep}...`);
  await cacheManifest(dep, freshManifest);
  return freshManifest;
};

export const loadBundleDescriptorFor = async (dep, version) => {
  initializeConfig();
  const cachedBundleDescriptor = await getCachedBundleDescriptor(depVersion(dep, version));
  if (cachedBundleDescriptor) {
    console.log(`Using cached bundle descriptor for ${depVersion(dep, version)}.`)
    return cachedBundleDescriptor;
  }

  console.log(`Fetching bundle descriptor for ${depVersion(dep, version)}...`);
  const freshBundleDescriptor = await axios.get(`http://localhost:8080/api/v1/bundles/${dep}/releases/${version}`)
    .then(R.prop('data'));
  
  console.log(`Caching bundle descriptor for ${depVersion(dep, version)}...`);
  await cacheBundleDescriptor(depVersion(dep, version), freshBundleDescriptor);
  return freshBundleDescriptor;
};

export const getLatestVersionFor = async dep => {
  const manifest = await loadManifestFor(dep);
  return manifest.latest;
};

const ensureBundleIsCached = async (name, version) => {
  if (fs.existsSync(`${cachePath()}/${name}/${version}`)) {
    return;
  }

  mkdirp.sync(`${cachePath()}/${name}/${version}`);
  const writer = fs.createWriteStream(`${cachePath()}/${name}/${version}/bundle.json`);

  await axios.get(`http://localhost:8080/api/v1/bundles/${name}/releases/${version}`, { responseType: 'stream' })
    .then(response => {
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    });
};

export const unpackBundleInto = async (name, version, path) => {
  initializeConfig();
  await ensureBundleIsCached(name, version);
  await recursiveCopy(`${cachePath()}/${name}/${version}`, path);
};
