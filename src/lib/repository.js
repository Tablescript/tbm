import fs from 'fs';
import os from 'os';
import mkdirp from 'mkdirp';
import recursiveCopy from 'recursive-copy';
import tar from 'tar';
import { getAndStreamInto } from './remote';

const cachePath = () => {
  const homeDir = os.homedir();
  return `${homeDir}/.tbm/cache`;
};

const bundleCachePath = (name) => `${cachePath()}/${name}`;
const manifestPath = (name) => `${bundleCachePath(name)}/manifest.json`;
const versionedName = (name, version) => `${name}-${version}`;
const bundleVersionPath = (name, version) => `${bundleCachePath(name)}/${versionedName(name, version)}`;
const bundleFilePath = (name, version) => `${bundleVersionPath(name, version)}/bundle.json`;
const tarballFilename = (name, version) => `${versionedName(name, version)}.tgz`;
const tarballPath = (name, version) => `${bundleCachePath(name)}/${tarballFilename(name, version)}`;

const repoRoot = 'http://localhost:8080/api/v1';
const repoManifestUrl = (name) => `${repoRoot}/bundles/${name}/manifest`;
const repoBundleTarballUrl = (name, version) => `${repoRoot}/bundles/${name}/-/${tarballFilename(name, version)}`;

const ensureCachePathExists = () => {
  mkdirp.sync(cachePath());
};

const ensureBundleCachePathExists = (name) => {
  mkdirp.sync(bundleCachePath(name));
};

const initializeConfig = () => {
  ensureCachePathExists();
};

const bundleFileExists = (name, version) => fs.existsSync(bundleFilePath(name, version));
const manifestFileExists = (name) => fs.existsSync(manifestPath(name));

const ensureManifestIsCached = async (name) => {
  if (manifestFileExists(name)) {
    return;
  }

  ensureBundleCachePathExists(name);
  const writer = fs.createWriteStream(manifestPath(name));
  await getAndStreamInto(repoManifestUrl(name), writer);
};

const ensureBundleIsCached = async (name, version) => {
  if (bundleFileExists(name, version)) {
    return;
  }

  ensureBundleCachePathExists(name);
  const writer = fs.createWriteStream(tarballPath(name, version));
  await getAndStreamInto(repoBundleTarballUrl(name, version), writer);

  await tar.extract({ file: tarballPath(name, version), cwd: bundleCachePath(name) });
};

export const loadManifestFor = async (name) => {
  initializeConfig();
  await ensureManifestIsCached(name);

  return JSON.parse(fs.readFileSync(manifestPath(name), 'utf-8'));
};

export const loadBundleDescriptorFor = async (name, version) => {
  initializeConfig();
  await ensureBundleIsCached(name, version);

  return JSON.parse(fs.readFileSync(bundleFilePath(name, version), 'utf-8'));
};

export const getLatestVersionFor = async (name) => {
  const manifest = await loadManifestFor(name);
  return manifest.latest;
};

export const unpackBundleInto = async (name, version, outputPath) => {
  initializeConfig();
  await ensureBundleIsCached(name, version);
  await recursiveCopy(bundleVersionPath(name, version), outputPath);
};
