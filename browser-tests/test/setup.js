var wd = require('wd');
var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');
var childProcess = require('child_process');

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
console.log('starting server on port 8000');
server.listen(8000);

// http configuration, not needed for simple runs
wd.configureHttp({
  timeout: 60000,
  retryDelay: 15000,
  retries: 5
});

var webdriverProcess = undefined;

var createBrowser = function () {
  var browser = wd.promiseChainRemote('http://localhost:9515');
  if (process.env.VERBOSE || true) {
    // optional logging
    browser.on('status', function (info) {
      console.log(info.cyan);
    });
    browser.on('command', function (meth, path, data) {
      console.log(' > ' + meth.yellow, path.grey, data || '');
    });
  }
  var initBrowser = function () {
    return browser
      .init()
      .setAsyncScriptTimeout(3000)
      .then(function () {
        return browser;
      });
  };
  return new Promise(function (resolve, reject) {
    console.log('Starting selenium');
    var chromedriverBinPath = require('chromedriver').path;
    console.log('Starting '+ chromedriverBinPath);
    webdriverProcess = childProcess.spawn(chromedriverBinPath, [], {});
    var resolved = false;
    webdriverProcess.on('close', function(code) {
      webdriverProcess = undefined;
      if (!resolved) {
        console.log('chromedriver exited with code ' + code);
      } else {
        reject('chromedriver exited with code ' + code)
      }
    });
    webdriverProcess.stdout.on('data', function(data) {
      console.log('> ' + data.toString());
      if (!resolved) {
        resolved = true;
        resolve(initBrowser().catch(function(err) { webdriverProcess.kill(); throw err;}));
      }
    });
    webdriverProcess.stderr.on('data', function(data) {
      console.log('! ' + data);
    });
  });
};

var quitBrowser = function (browser, allPassed) {
  if (browser) {
    browser = browser.quit();
    if (webdriverProcess) {
      browser.then(function () {
        console.log('Killing webdriver process');
        webdriverProcess.kill();
      });
    }
    if (server) {
      server.close();
    }
  }
  return browser;
};

var setup = {
  rootUrl: 'http://localhost:8000',
  server: server,
  browserCapabilities: { browserName: 'chrome' },
  sauce: false,
  createBrowser: createBrowser, // returns a promise for a browser
  quitBrowser: quitBrowser
};

module.exports = setup;
