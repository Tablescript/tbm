import readline from 'readline';
import {
  defaultBundleDescriptor,
  bundleDescriptorExists,
  readBundleDescriptor,
  writeBundleDescriptor,
} from '../descriptor';

const ask = (rl, answers, question) => new Promise((resolve) => {
  rl.question(`${question.query} [${answers[question.name] || ''}]: `, (answer) => {
    if (answer) {
      resolve({
        ...answers,
        [question.name]: answer,
      });
    } else {
      resolve(answers);
    }
  });
});

const applyParameter = (value, key) => (descriptor) => {
  if (value) {
    return {
      ...descriptor,
      [key]: value,
    };
  }
  return descriptor;
};

const allParameters = (applyParameter, options) => ([
  applyParameter(options.bundleName, 'name'),
  applyParameter(options.bundleDescription, 'description'),
  applyParameter(options.bundleVersion, 'version'),
  applyParameter(options.main, 'main'),
  applyParameter(options.author, 'author'),
  applyParameter(options.email, 'email'),
  applyParameter(options.url, 'url'),
  applyParameter(options.license, 'license'),
]);

const answersFromCommandLine = parameters => parameters.reduce((acc, applyParameter) => applyParameter(acc), {});

const buildQuestion = (query, name) => ({ query, name });
const allQuestions = buildQuestion => ([
  buildQuestion('Bundle name', 'name'),
  buildQuestion('Description', 'description'),
  buildQuestion('Version', 'version'),
  buildQuestion('Main script', 'main'),
  buildQuestion('Author name', 'author'),
  buildQuestion('Author email', 'email'),
  buildQuestion('Bundle URL', 'url'),
  buildQuestion('License', 'license'),
]);

const questionReducer = rl => (acc, question) => acc.then(answers => ask(rl, answers, question));
const askAll = (rl, questions, initialResponses) => questions.reduce(questionReducer(rl), Promise.resolve(initialResponses));

const currentDirectoryName = () => process.cwd().split('/').slice(-1)[0];

const getTemplateBundleDescriptor = (options) => {
  if (bundleDescriptorExists(options.bundle)) {
    return readBundleDescriptor(options.bundle);
  }
  return defaultBundleDescriptor(currentDirectoryName());
};

const init = (options) => {
  const loadedBundleDescriptor = getTemplateBundleDescriptor(options);
  const overriddenBundleDescriptor = {
    ...loadedBundleDescriptor,
    ...answersFromCommandLine(allParameters(applyParameter, options)),
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  askAll(rl, allQuestions(buildQuestion), overriddenBundleDescriptor).then((finalBundleDescriptor) => {
    writeBundleDescriptor(options.bundle, finalBundleDescriptor);
    process.exit(0);
  });
};

export default init;
