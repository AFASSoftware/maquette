let selenium = require('selenium-standalone');

let seleniumOptions = require('selenium-standalone/lib/default-config.js');

Object.keys(seleniumOptions.drivers).forEach(function(driver) {
  if (driver !== 'chrome') {
    delete seleniumOptions.drivers[driver];
  }
});

seleniumOptions.logger = function(message) {
  console.log(message);
};

selenium.install(seleniumOptions, function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  process.exit(0);
});
