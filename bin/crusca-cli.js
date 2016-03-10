#!/usr/bin/env node
'use strict';

// get the client
var cli = require("../lib/crusca-cli");

// get the cli arguments
var argv = require('../lib/cli-interface').argv();

// run the client with the given arguments
cli.default(argv);
