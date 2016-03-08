/**
 * Client Interface configuration
 * @type {{argv: module.exports.argv}}
 */
module.exports = {
  argv: () => {
    return require('yargs')
      .usage('Usage: $0 -i input-file-or-dir -o output-file')

      .example('$0 -i path/to/js -o project.pot',
        'Recursively scan the directory and parse JS files to look for strings')
      .example('$0 -i file.js -o project.pot',
        'parse single Javascript file to look for strings')

      .demand('i')
      .alias('i', 'in')
      .nargs('i', 1)
      .describe('i', 'File or directory to search for translation strings')

      .demand('o')
      .alias('o', 'out')
      .nargs('o', 1)
      .describe('o', 'Output file that will contain the extracted strings')

      .alias('e', 'ext')
      .describe('e', 'Whitelist file extensions you want to parse  (multiple entries allowed, default ".js")')

      .alias('g', 'ignore')
      .describe('g', 'Blacklist file or directories you don\'t want to scan (multiple entries allowed)')

      .alias('c', 'config')
      .describe('c', 'Custom config path (default ./cruscarc)')

      .alias('v', 'verbose')
      .describe('v', 'Enable chatty version')

      .help('h')
      .alias('h', 'help')

      .argv;
  }
};
