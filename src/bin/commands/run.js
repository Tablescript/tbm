import { execSync } from 'child_process';
import {
  readBundleDescriptor,
  bundleHasMainScript,
  bundleMainScript,
} from '../descriptor';

const run = (options) => {
  const bundle = readBundleDescriptor();
  if (!bundleHasMainScript(bundle)) {
    console.log('No main script defined');
    process.exit(1);
  }
  const command = `tablescript ${bundleMainScript(bundle)}`;
  const output = execSync(command, { encoding: 'utf-8' });
  console.log(output);
};

export default run;
