'use strict';

const crusca = require('crusca');
const Promise = require('bluebird');
const fs = require('graceful-fs');
const path = require('path');
const recursive = require('recursive-readdir');
const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);

const argv = require('./cli-interface').argv();

const filePath = argv.in;
const outFile = argv.out;
const verbose = argv.verbose;

// Default should go in a separate place
const DEFAULT_CONFIG = './.cruscarc';
const DEFAULT_EXTENSIONS = ['.js'];
const DEFAULT_IGNORE = [];

const isFile = fs.lstatSync(filePath).isFile();

const getConfig = () => {
  const configFile = argv.config || DEFAULT_CONFIG;

  try {
    fs.lstatSync(configFile);
  } catch(err) {
    return {};
  }

  return JSON.parse(
    fs.readFileSync(configFile, 'utf8')
  );
};

const processFile = (data, filePath, pKeys) => {
  const keys = crusca.extract(data);
  return crusca.tagKeys(keys, filePath, pKeys);
};

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

  const config = getConfig();

  const ignoreArr = config.ignore || DEFAULT_IGNORE;
  const extensions = config.extensions || DEFAULT_EXTENSIONS;
  const whitelistFunc = (file, stats) => {
    return stats.isFile() ? extensions.indexOf(path.extname(file)) === -1 : false;
  };

  const ignoreArguments = ignoreArr.length > 0 ? ignoreArr.concat(whitelistFunc) : [whitelistFunc];
  recursive(filePath, ignoreArguments, (err, files) => {
    const fileContentArray = files.map((file) => readFile(file, 'utf8'));
    const filesCount = fileContentArray.length;

    Promise.all(fileContentArray).then((data) => {
      const taggedKeys = data.reduce((keys, data, idx) => {
        if (verbose) console.log(files[idx]);
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
