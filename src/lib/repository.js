import axios from 'axios';
import * as R from 'ramda';

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
