'use strict';

const crusca = require('crusca');
const Promise = require('bluebird');
const fs = require('graceful-fs');
const path = require('path');
const recursive = require('recursive-readdir');
const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);

// Default should go in a separate place
const DEFAULT_CONFIG = './.cruscarc';
const DEFAULT_EXTENSIONS = ['.js'];
const DEFAULT_IGNORE = [];
const DEFAULT_VERBOSE = false;

const getConfig = (opts) => {
  const configFile = opts.config;

  try {
    fs.lstatSync(configFile);
  } catch(err) {
    return {};
  }

  return JSON.parse(
    fs.readFileSync(configFile, 'utf8')
  );
};

const ensureLeadingDot = (extArray) => {
  return extArray.map((ext) => {
    return ext.charAt(0) === '.' ? ext : `.${ext}`
  })
}

const processFile = (data, filePath, pKeys) => {
  const keys = crusca.extract(data);
  return crusca.tagKeys(keys, filePath, pKeys);
};

export default (argv) => {
  const filePath = argv.in;
  const outFile = argv.out;

  // Establishing optional parameters
  const opts = {
    config: argv.config || DEFAULT_CONFIG,
    extensions: argv.e
      ? Array.isArray(argv.e) ? argv.e : [argv.e]
      : DEFAULT_EXTENSIONS,
    ignore: argv.g
      ? Array.isArray(argv.g) ? argv.g : [argv.g]
      : DEFAULT_IGNORE,
    verbose: argv.v || DEFAULT_VERBOSE
  };

  const isFile = fs.lstatSync(filePath).isFile();

  if (isFile) {

    readFile(filePath, 'utf8').then((data) => {
      const taggedKeys = processFile(data, filePath);
      const keysCount = Object.keys(taggedKeys).length;

      writeFile(outFile, crusca.generatePot(taggedKeys)).then(() => {
        console.log(`${keysCount} strings extracted from ${filePath}`);
        process.exit(0);
      }, (err) => {
        throw new Error(err);
      });
    });
  } else {

    const config = getConfig(opts);

    const ignoreArr = config.ignore || opts.ignore;
    const extensions = config.extensions || opts.extensions;
    const whitelistExts = ensureLeadingDot(extensions);
    const whitelistFunc = (file, stats) => {
      return stats.isFile() ? whitelistExts.indexOf(path.extname(file)) === -1 : false;
    };

    const ignoreArguments = ignoreArr.length > 0 ? ignoreArr.concat(whitelistFunc) : [whitelistFunc];
    recursive(filePath, ignoreArguments, (err, files) => {
      const fileContentArray = files.map((file) => readFile(file, 'utf8'));
      const filesCount = fileContentArray.length;

      Promise.all(fileContentArray).then((data) => {
        const taggedKeys = data.reduce((keys, data, idx) => {
          if (opts.verbose) console.log(files[idx]);
          return processFile(data, files[idx], keys)
        }, {});

        const keysCount = Object.keys(taggedKeys).length;
        const potFileContent = crusca.generatePot(taggedKeys);

        writeFile(outFile, potFileContent).then(() => {
          console.log(`${keysCount} strings extracted from ${filesCount} files.`);
          process.exit(0);
        }, (err) => {
          throw new Error(err);
        });
      });
    });
  }
}
