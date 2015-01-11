'use strict';

var testSuite = require('./test.js');
var fs = require('fs');
var argv = require('optimist').default('laxMode', false).default('browser', 'chrome').argv;
var rootUrl = 'http://localhost:8000';

testSuite.todoMVCTest(
	"maquette",
	rootUrl + '/examples/todomvc/index.html', argv.speedMode,
	argv.laxMode, argv.browser);
