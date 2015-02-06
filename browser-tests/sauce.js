'use strict';

var Mocha = require("mocha");

var desiredName = process.argv[2];

var desireds = require("./desireds");

var setup = require("./test/setup");
setup.sauce = true;

if (desiredName) {
  var desired = desireds[desiredName];
  if(!desired) {
    throw new Error("Desired browser not found in desireds.js: " + desiredName);
  }
  desireds = {};
  desireds[desiredName] = desired;
}

var desiredNames = Object.keys(desireds);
var desiredIndex = 0;

var totalErrors = 0;

var next = function () {
  if(desiredIndex < desiredNames.length) {
    setup.browserCapabilities = desireds[desiredNames[desiredIndex++]];
    var mochaInstance = new Mocha({ timeout: 60000 });
    mochaInstance.addFile("test/todomvc-specs.js");
    mochaInstance.run(function (errCount) {
      totalErrors += errCount;
      next();
    });
  } else {
    console.log("Total errors: " + totalErrors);
    process.exit(0);
  }
};

next();

