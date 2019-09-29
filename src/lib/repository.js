import axios from 'axios';
import fs from 'fs';
import os from 'os';
import mkdirp from 'mkdirp';
import recursiveCopy from 'recursive-copy';
import tar from 'tar';

const cachePath = () => {
  const homeDir = os.homedir();
  return `${homeDir}/.tbm/cache`;
};

const bundleCachePath = name => `${cachePath()}/${name}`;

const tarballFilename = (name, version) => `${name}-${version}.tgz`;

const ensureCachePathExists = () => {
  mkdirp.sync(cachePath());
};

const ensureBundleCachePathExists = (name) => {
  mkdirp.sync(bundleCachePath(name));
};

const initializeConfig = () => {
  ensureCachePathExists();
};  

const ensureManifestIsCached = async (dep) => {
  if (fs.existsSync(`${bundleCachePath(dep)}/manifest.json`)) {
    return;
  }

  console.log(`Fetching bundle manifest for ${dep}...`);
  ensureBundleCachePathExists(dep);
  const manifestPath = `${bundleCachePath(dep)}/manifest.json`;
  const writer = fs.createWriteStream(manifestPath);
  await axios.get(`http://localhost:8080/api/v1/bundles/${dep}/manifest`, { responseType: 'stream' })
    .then(response => {
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    });
};

export const loadManifestFor = async dep => {
  initializeConfig();
  await ensureManifestIsCached(dep);

  return JSON.parse(fs.readFileSync(`${bundleCachePath(dep)}/manifest.json`, 'utf-8'));
};

export const loadBundleDescriptorFor = async (dep, version) => {
  initializeConfig();
  await ensureBundleIsCached(dep, version);

  return JSON.parse(fs.readFileSync(`${cachePath()}/${dep}/${dep}-${version}/bundle.json`, 'utf-8'));
};

export const getLatestVersionFor = async dep => {
  const manifest = await loadManifestFor(dep);
  return manifest.latest;
};

const ensureBundleIsCached = async (name, version) => {
  if (fs.existsSync(`${cachePath()}/${name}/${name}-${version}/bundle.json`)) {
    return;
  }

  console.log(`Fetching bundle for ${name}@${version}...`);
  ensureBundleCachePathExists(name);
  const tarballPath = `${bundleCachePath(name)}/${tarballFilename(name, version)}`;
  const writer = fs.createWriteStream(tarballPath);
  await axios.get(`http://localhost:8080/api/v1/bundles/${name}/releases/${version}`, { responseType: 'stream' })
    .then(response => {
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    });
  
  await tar.extract({ file: tarballPath, cwd: bundleCachePath(name) });
};

export const unpackBundleInto = async (name, version, path) => {
  initializeConfig();
  await ensureBundleIsCached(name, version);
  await recursiveCopy(`${cachePath()}/${name}/${name}-${version}`, path);
};
