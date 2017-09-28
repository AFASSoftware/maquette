var wd = require('wd');
var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');

// double click is not 'natively' supported, so we need to send the
// event direct to the element see:
// http://stackoverflow.com/questions/3982442/selenium-2-webdriver-how-to-double-click-a-table-row-which-opens-a-new-window
var doubleClickScript = 'var evt = document.createEvent("MouseEvents");' +
  'evt.initMouseEvent("dblclick",true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0,null);' +
  'document.querySelectorAll("#todo-list li label")[arguments[0]].dispatchEvent(evt);';

// Serve up public/ftp folder
var serve = serveStatic('..', {});

// Create server
var server = http.createServer(function (req, res) {
  var done = finalhandler(req, res);
  serve(req, res, done);
});

// Listen
console.log("starting server on port 8000");
server.listen(8000);

// http configuration, not needed for simple runs
wd.configureHttp({
  timeout: 60000,
  retryDelay: 15000,
  retries: 5
});

var webdriverProcess = undefined;

var createBrowser = function () {
  var desired = {};
  Object.keys(setup.browserCapabilities).forEach(function (key) {
    desired[key] = setup.browserCapabilities[key];
  });
  desired.tags = ['maquette'];
  if (process.env.TRAVIS_BUILD_NUMBER) {
    desired.build = "build-" + process.env.TRAVIS_BUILD_NUMBER;
  }
  if (process.env.TRAVIS_JOB_NUMBER) {
    desired["tunnel-identifier"] = process.env.TRAVIS_JOB_NUMBER;
  }
  var browser;
  if (setup.sauce) {
    if(!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
      throw new Error(
        'Sauce credentials were not configured, configure your sauce credential as follows:\n\n' +
        'export SAUCE_USERNAME=<SAUCE_USERNAME>\n' +
        'export SAUCE_ACCESS_KEY=<SAUCE_ACCESS_KEY>\n\n'
      );
    }
    var username = process.env.SAUCE_USERNAME;
    var accessKey = process.env.SAUCE_ACCESS_KEY;
    browser = wd.promiseChainRemote("localhost", 4445, username, accessKey);
  } else {
    browser = wd.promiseChainRemote("localhost", 4444, null, null);
  }
  if (process.env.VERBOSE) {
    // optional logging
    browser.on('status', function (info) {
      console.log(info.cyan);
    });
    browser.on('command', function (meth, path, data) {
      console.log(' > ' + meth.yellow, path.grey, data || '');
    });
  }
  var initBrowser = function() {
    return browser
      .init(desired)
      .setAsyncScriptTimeout(3000)
      .then(function () {
        return browser;
      });
  };
  if (setup.sauce) {
    return initBrowser();
  } else {
    return new Promise(function(resolve, reject) {
      console.log('Starting selenium');
      require('selenium-standalone').start({
        drivers: {
          chrome: require('selenium-standalone/lib/default-config.js').drivers.chrome
        },
        spawnCb: function() {
          console.log('selenium starting');
        }
      }, function(err, child) {
        if (err) {
          console.log('ERR')
          reject(err);
          return;
        }
        console.log('webdriver process created');
        webdriverProcess = child;
        resolve(initBrowser());
      });
    });
  }
};

var quitBrowser = function (browser, allPassed) {
  if(browser) {
    browser = browser.quit();
    if(setup.sauce) {
      browser = browser.sauceJobStatus(allPassed);
    }
    if (webdriverProcess) {
      browser.then(function() {
        console.log('Killing webdriver process');
        webdriverProcess.kill();
      });
    }
  }
  return browser;
};

var setup = {
  rootUrl: 'http://localhost:8000',
  server: server,
  browserCapabilities: { browserName: "chrome" },
  sauce: false,
  createBrowser: createBrowser, // returns a promise for a browser
  quitBrowser: quitBrowser
};

module.exports = setup;
