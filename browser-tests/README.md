Maquette Browser tests
=========

This directory contains a test-suite of browser tests. They can be run using the following commands:

### mocha

Assumes you have a webdriver running on http://localhost:4444/hub/wd.
This can be achieved using one of the following commands:

- `phantomjs --webdriver=127.0.0.1:4444`
- `java -jar selenium-server-standalone-2.44.0.jar -role hub -Dwebdriver.chrome.driver=chromedriver` (You can call mocha with a `--browserName=` argument to select a specific browser.)

### node sauce [desiredKey]

Runs the tests in sauce. If desiredKey is not specified, all browsers specified in desireds.js are run sequentially.
If desiredKey is specified, only that entry from desireds.js is run.

You need to make sure the following exports have the right values:

- `export SAUCE_USERNAME=`
- `export SAUCE_ACCESS_KEY=`
