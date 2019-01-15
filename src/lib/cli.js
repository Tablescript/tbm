import program from 'commander';
import { version } from '../../package.json';
import init from './commands/init';
import add from './commands/add';
import remove from './commands/remove';
import sync from './commands/sync';
import run from './commands/run';
import list from './commands/list';

const main = () => {
  program
    .version(version);

  program
    .command('init')
    .description('[re-]initialize bundle')
    .option('-f, --bundle [filename]', 'bundle file', 'bundle.json')
    .option('-n, --bundle-name [name]', 'bundle name')
    .option('-d, --bundle-description [description]', 'description')
    .option('-v, --bundle-version [version]', 'bundle version')
    .option('-m, --main [main]', 'main script')
    .option('-a, --author [name]', 'author name')
    .option('-e, --email [email]', 'author email')
    .option('-u, --url [url]', 'bundle URL')
    .option('-L, --license [license]', 'license')
    .action(init);

  program
    .command('login')
    .description('log into bundle repository')
    .option('-f, --bundle [filename]', 'bundle file', 'bundle.json')
    .action(() => {
      console.log('login');
    });

  program
    .command('logout')
    .description('log out of bundle repository')
    .option('-f, --bundle [filename]', 'bundle file', 'bundle.json')
    .action(() => {
      console.log('logout');
    });

  program
    .command('publish')
    .description('publish bundle to repository')
    .option('-f, --bundle [filename]', 'bundle file', 'bundle.json')
    .action(() => {
      console.log('publish');
    });

  program
    .command('add <name> [version]')
    .description('add dependency')
    .option('-f, --bundle [filename]', 'bundle file', 'bundle.json')
    .option('-l, --lockfile [filename]', 'lockfile', 'bundle.lock')
    .action(add);

  program
    .command('remove <name>')
    .description('remove dependency')
    .option('-f, --bundle [filename]', 'bundle file', 'bundle.json')
    .option('-l, --lockfile [filename]', 'lockfile', 'bundle.lock')
    .action(remove);

  program
    .command('sync')
    .description('reinstall all dependencies')
    .option('-f, --bundle [filename]', 'bundle file', 'bundle.json')
    .option('-l, --lockfile [filename]', 'lockfile', 'bundle.lock')
    .action(sync);

  program
    .command('run')
    .description('run Tablescript script')
    .option('-f, --bundle [filename]', 'bundle file', 'bundle.json')
    .action(run);

  program
    .command('list')
    .description('list bundle dependencies')
    .option('-f, --bundle [filename]', 'bundle file', 'bundle.json')
    .action(list);

  program.parse(process.argv);
};

export default main;
