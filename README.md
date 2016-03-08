# crusca-cli

`crusca-cli` is the Node client for `crusca`, a drop-in replacement for `xgettext` to 
extract translation strings from Javascript files.

`xgettext` falls short on ES6 template strings, that are incidentally the best and more modern
way to create translation strings in JS clients.

---

From this approach that implies an `String.prototype.format` hack in place
```js
  const str1 = t('Organisation {0} is now {1} #orgStatus').format(orgName, orgStatus);
  const str2 = t('Fill in the {0} #academy').format('<strong>{0}</strong>').format(this.state.title);
```

To this purely native approach
```js
  const str1 = t`Organisation ${orgName} is now ${orgStatus} #orgStatus`;
  const str2 = t`Fill in the ${this.state.title} #academy`;
```

---

In it's very simplest form, this is it
```sh
# from this
find app/assets -type f -iname '*.js' | xargs xgettext --no-wrap --default-domain=javascripts --keyword=t --from-code=UTF-8 -o $pot_file

# to this
node_modules/.bin/crusca-cli -i app/assets -o $pot_file
```


## Usage
```
crusca-cli -i path/to/files -o output.pot [-e -g -c -v]
```

### Examples

Scanning the directory `/Users/domo/projects/myPrj` to look for `.js` files and extract strings 
using all the default parameters.

```
crusca-cli -i /Users/domo/projects/myPrj -o myPrj.pot
```

---

Parse a single file and extract strings from it.  
**Note:** any `--ignore` or `--ext` option will be ignored when parsing a single file.

```
crusca-cli -i file.js -o strings.pot
```

## Installation

You can either install `crusca-cli` as a global package or local to your project.

#### globally
```
npm install -g crusca-cli
```

You can then use it anywhere by simply calling `crusca-cli`

#### locally
```
npm install --save-dev crusca-cli
```

`crusca-cli` will then be available in `node_modules/.bin/crusca-cli`.  
You can either use it from an NPM-script simply by calling it or you can reference to it's path to 
access it from anywhere, like a shell script.

E.g. 
```json
"scripts": {
  "extract": "crusca-cli -i ./src -o strings.pot -e .js -e .jsx"
}
```

or 

```bash
#!/bin/bash

prj_dir=./src
output=strings.pot

node_modules/.bin/crusca-cli -i $prj_dir -o $output
```

## Config File

`crusca-cli` can be configured using a config file which takes the same options listed in the 
[options](#options) section, except `--config` obviously.

```json
{
  "ignore": [
    "bower_components",
    "node_modules"
  ],
  "extensions": ["js", "jsx"]
}
```

## Options

Bold options are **required**

|   Options     | Default  | Description                                               |
|---------------|:--------:|-----------------------------------------------------------|
| **-i, --in**  |    --    | File or directory to search for translation strings       |
| **-o, --out** |    --    | Output file that will contain the extracted strings       |
| -e, --ext     |   .js    | Whitelist file extensions you want to parse (adds leading dot, if missing).<br />Multiple entries are allowed |
| -g, --ignore  |   []     | Blacklist file or directories you don't want to scan.<br />Support [minimatch](https://github.com/isaacs/minimatch) glob expressions. Multiple entries are allowed |
| -c, --config  | ./cruscarc | Custom config path                                      |
| -v, --verbose |  false   | Enable chatty version                                     |
| -q, --quite   |  false   | Completely silent on success                              |
| -h, --help    |    --    | Show help                                                 |

### Configurations Priority

It is important to note that there is a priority when supplying options
 
```
config_file (default or custom with -c)
├── cli_arguments
├───── default_arguments
```
 
**For example**  
`crusca-cli -i some/folder -o strings.pot -c ./conf -e js -e jsx -g test`

Where **./conf** is
```
{
  "ext": "js"
}
```

Will only consider `.js` files, because the config has higher priority, while still 
ignoring the folder `test`, since it has not been overridden in the config file

## TODOs

- [x] get the same params of .cruscarc from command line
- [ ] add `crusca` options to `crusca-cli` config file and command line
- [x] implement --ignore and --ext as cli options
- [ ] implement --verbose, --in, --out in `cruscarc`
- [ ] put defaults in a separate place
- [ ] output JSON to console (--json, -j)
- [x] add tests

## License

The MIT License (MIT)

Copyright (c) 2016 Domenico Matteo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
