'use strict';

const crusca = require('crusca');
const Promise = require('bluebird');
const fs = require('graceful-fs');
const path = require('path');
const recursive = Promise.promisify(require('recursive-readdir'));
const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);

// Default should go in a separate place
const DEFAULT_CONFIG = './.cruscarc';
const DEFAULT_EXTENSIONS = ['.js'];
const DEFAULT_IGNORE = [];
const DEFAULT_VERBOSE = false;
const DEFAULT_QUIET = false;

const isWindows = process.platform === 'win32';

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

const ensureArray = (data) => {
  return Array.isArray(data)
    ? data
    : [data]
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
    config: argv.c || DEFAULT_CONFIG,
    ext: argv.e
      ? ensureArray(argv.e)
      : DEFAULT_EXTENSIONS,
    ignore: argv.g
      ? ensureArray(argv.g)
      : DEFAULT_IGNORE,
    verbose: argv.v || DEFAULT_VERBOSE,
    quiet: argv.q || DEFAULT_QUIET
  };

  const isFile = fs.lstatSync(filePath).isFile();

  if (isFile) {

    return readFile(filePath, 'utf8').then((data) => {
      const taggedKeys = processFile(data, filePath);
      const keysCount = Object.keys(taggedKeys).length;

      return writeFile(outFile, crusca.generatePot(taggedKeys)).then(() => {
        if (!opts.quiet) console.log(`${keysCount} strings extracted from ${filePath}`);
        return {
          files: 1,
          strings: keysCount
        }
      }, (err) => {
        throw new Error(err);
      });
    });
  } else {

    const config = getConfig(opts);

    const ignoreArr = config.ignore
      ? ensureArray(config.ignore)
      : opts.ignore

    const extensions = config.ext
      ? ensureArray(config.ext)
      : opts.ext

    const whitelistExts = ensureLeadingDot(extensions);
    const whitelistFunc = (file, stats) => {
      return stats.isFile() ? whitelistExts.indexOf(path.extname(file)) === -1 : false;
    };

    const ignoreArguments = ignoreArr.length > 0 ? ignoreArr.concat(whitelistFunc) : [whitelistFunc];
    return recursive(filePath, ignoreArguments).then((files) => {
      const slashAdjustedFiles = isWindows ? files.map.replace('\\', '/') : files;
      const fileContentArray = slashAdjustedFiles.sort().map((file) => readFile(file, 'utf8'));
      const filesCount = fileContentArray.length;

      return Promise.all(fileContentArray).then((data) => {
        const taggedKeys = data.reduce((keys, data, idx) => {
          if (opts.verbose) console.log(files[idx]);
          return processFile(data, files[idx], keys)
        }, {});

        const keysCount = Object.keys(taggedKeys).length;
        const potFileContent = crusca.generatePot(taggedKeys);

        return writeFile(outFile, potFileContent).then(() => {
          if (!opts.quiet) console.log(`${keysCount} strings extracted from ${filesCount} files.`);
          return {
            files: filesCount,
            strings: keysCount
          }
        }, (err) => {
          throw new Error(err);
        });
      });
    });
  }
}
