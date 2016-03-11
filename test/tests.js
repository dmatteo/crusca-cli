'use strict';

const expect = require('unexpected').clone()
  .use(require('unexpected-sinon'));
import cli from '../src/crusca-cli';

/*

  * Folder
    * test every option
      * with config file
      * with args
  
  * File
    * test every option
      * with config file
      * with args

  * Output
    * check file in both cases
    * also check output to console (still to be implemented)

*/
describe('crusca-cli', () => {

  describe('running on a folder', () => {

    describe('with cli arguments', () => {
      let opts;

      beforeEach(() => {
        opts = { 
          in: 'test/folder-test',
          _: [],
          help: false,
          out: 'strings.pot',
          e: undefined,
          g: undefined,
          q: true
        };
      });

      it('with default parameters', () => {
        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 2,
            strings: 6
          });
        });
      });

      it('with --ext parameter (single)', () => {
        opts.e = 'jsx';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });

      it('with --ext parameter (multiple)', () => {
        opts.e = ['js', 'jsx'];

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 3,
            strings: 8
          });
        });
      });

      it('with --ignore parameter (folder)', () => {
        opts.g = 'subfolder';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });

      it('with --ignore parameter (minimatch)', () => {
        opts.g = '**/*.jsx';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 2,
            strings: 6
          });
        });
      });
    });

    describe('with config file', () => {

      let opts;

      beforeEach(() => {
        opts = {
          in: 'test/folder-test',
          _: [],
          help: false,
          out: 'strings.pot',
          e: undefined,
          g: undefined,
          q: true
        };
      });

      it('with --ext parameter (single)', () => {
        opts.c = 'test/config-files/extSingle';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });

      it('with --ext parameter (multiple)', () => {
        opts.c = 'test/config-files/extMulti';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 3,
            strings: 8
          });
        });
      });

      it('with --ignore parameter (folder)', () => {
        opts.c = 'test/config-files/ignoreFolder';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });

      it('with --ignore parameter (minimatch)', () => {
        opts.c = 'test/config-files/ignoreMinimatch';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 2,
            strings: 6
          });
        });
      });
    });

  });

  describe('running on a file', () => {

    describe('with cli arguments', () => {
      let opts;

      beforeEach(() => {
        opts = {
          in: 'test/folder-test/dotJs.js',
          _: [],
          help: false,
          out: 'strings.pot',
          e: undefined,
          g: undefined,
          q: true
        };
      });

      it('with default parameters', () => {
        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });

      it('with --ext parameter (single) [ignored]', () => {
        opts.e = 'jsx';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });

      it('with --ext parameter (multiple) [ignored]', () => {
        opts.e = ['js', 'jsx'];

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });

      it('with --ignore parameter (folder) [ignored]', () => {
        opts.g = 'subfolder';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });

      it('with --ignore parameter (minimatch) [ignored]', () => {
        opts.g = '**/*.jsx';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });
    });

    describe('with config file', () => {
      let opts;

      beforeEach(() => {
        opts = {
          in: 'test/folder-test/dotJs.js',
          _: [],
          help: false,
          out: 'strings.pot',
          e: undefined,
          g: undefined,
          q: true
        };
      });

      it('with default parameters', () => {
        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });

      it('with --ext parameter (single) [ignored]', () => {
        opts.c = 'test/config-files/extSingler';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });

      it('with --ext parameter (multiple) [ignored]', () => {
        opts.c = 'test/config-files/extMultiple';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });

      it('with --ignore parameter (folder) [ignored]', () => {
        opts.c = 'test/config-files/ignoreFolder';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });

      it('with --ignore parameter (minimatch) [ignored]', () => {
        opts.c = 'test/config-files/ignoreMinimatch';

        return cli(opts).then((data) => {
          return expect(data, 'to equal', {
            files: 1,
            strings: 3
          });
        });
      });
    });

  });


});