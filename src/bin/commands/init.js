import readline from 'readline';
import {
  defaultBundleDescriptor,
  bundleDescriptorExists,
  readBundleDescriptor,
  writeBundleDescriptor,
} from '../../lib/descriptor';

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

const allParameters = (applyParameterFn, options) => ([
  applyParameterFn(options.bundleName, 'name'),
  applyParameterFn(options.bundleDescription, 'description'),
  applyParameterFn(options.bundleVersion, 'version'),
  applyParameterFn(options.main, 'main'),
  applyParameterFn(options.author, 'author'),
  applyParameterFn(options.email, 'email'),
  applyParameterFn(options.url, 'url'),
  applyParameterFn(options.license, 'license'),
]);

const answersFromCommandLine = (parameters) => parameters.reduce((acc, applyParameterFn) => applyParameterFn(acc), {});

const buildQuestion = (query, name) => ({ query, name });
const allQuestions = (buildQuestionFn) => ([
  buildQuestionFn('Bundle name', 'name'),
  buildQuestionFn('Description', 'description'),
  buildQuestionFn('Version', 'version'),
  buildQuestionFn('Main script', 'main'),
  buildQuestionFn('Author name', 'author'),
  buildQuestionFn('Author email', 'email'),
  buildQuestionFn('Bundle URL', 'url'),
  buildQuestionFn('License', 'license'),
]);

const questionReducer = (rl) => (acc, question) => acc.then((answers) => ask(rl, answers, question));
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
