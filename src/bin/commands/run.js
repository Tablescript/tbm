import { execSync } from 'child_process';
import {
  readBundleDescriptor,
  bundleHasMainScript,
  bundleMainScript,
} from '../../lib/descriptor';

const run = () => {
  const bundle = readBundleDescriptor();
  if (!bundleHasMainScript(bundle)) {
    console.log('No main script defined'); // eslint-disable-line no-console
    process.exit(1);
  }
  const command = `tablescript ${bundleMainScript(bundle)}`;
  const output = execSync(command, { encoding: 'utf-8' });
  console.log(output); // eslint-disable-line no-console
};

export default run;
