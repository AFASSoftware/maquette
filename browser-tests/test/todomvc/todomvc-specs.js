'use strict';

var fs = require('fs');
var rootUrl = 'http://localhost:8000';

var wd = require('wd');
require('colors');
var _ = require("lodash");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

var createTodoPage = require("./todoPage");

chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

var sauce = true;
// checking sauce credential
if(!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY){
  console.warn(
    '\nNot using sauce, if you want to use sauce configure your sauce credential as follows:\n\n' +
    'export SAUCE_USERNAME=<SAUCE_USERNAME>\n' +
    'export SAUCE_ACCESS_KEY=<SAUCE_ACCESS_KEY>\n\n'
  );
  sauce = false;
  //    throw new Error("Missing sauce credentials");
}

// http configuration, not needed for simple runs
wd.configureHttp( {
  timeout: 60000,
  retryDelay: 15000,
  retries: 5
});

var desired = JSON.parse(process.env.DESIRED || '{browserName: "chrome"}');
desired.name = 'todomvc-specs ' + desired.browserName;
desired.tags = ['maquette'];

describe('todomvc-maquette (' + desired.browserName + ')', function() {
  var browser;
  var page;
  var allPassed = true;

  before(function (done) {
    if(sauce) {
      var username = process.env.SAUCE_USERNAME;
      var accessKey = process.env.SAUCE_ACCESS_KEY;
      browser = wd.promiseChainRemote("localhost", 4445, username, accessKey);
    } else {
      browser = wd.promiseChainRemote("localhost", 4444, username, accessKey);
    }
    if (true || process.env.VERBOSE) {
      // optional logging     
      browser.on('status', function(info) {
        console.log(info.cyan);
      });
      browser.on('command', function(meth, path, data) {
        console.log(' > ' + meth.yellow, path.grey, data || '');
      });            
    }
    browser
      .init(desired)
      .setAsyncScriptTimeout(3000)
      .then(function () {
        // Hack needed for sauce on windows
        require('dns').lookup(require('os').hostname(), function (err, add, fam) {
          console.log('local ip: ' + add);
          rootUrl = rootUrl.replace("localhost", add);
          page = createTodoPage(browser, browser.get(rootUrl + "/examples/todomvc/index.html"));
          done();
        });
      });
  });

  beforeEach(function (done) {
    browser.refresh().then(function () { done(); });
  });

  afterEach(function(done) {
    allPassed = allPassed && (this.currentTest.state === 'passed');
    //browser.executeAsync('localStorage["todomvc-maquette"]=null', done);
    browser.safeExecute('window.localStorage["todomvc-maquette"]=""')
      .then(function () { done(); });
  });

  after(function(done) {
    browser = browser.quit();
    if(sauce) {
      browser.sauceJobStatus(allPassed);
    }
    browser.nodeify(done);
  });

  // The tests

  var TODO_ITEM_ONE = 'buy some cheese';
  var TODO_ITEM_TWO = 'feed the cat';
  var TODO_ITEM_THREE = 'book a doctors appointment';

  var createStandardItems = function () {
    return page
      .enterItem(TODO_ITEM_ONE)
      .enterItem(TODO_ITEM_TWO)
      .enterItem(TODO_ITEM_THREE);
  };

  describe('When page is initially opened', function () {
  	it('should focus on the todo input field', function () {
  	  return page.assertFocussedElementId("new-todo");
	  });
  });
  
  describe('No Todos', function () {
  	it('should hide #main and #footer', function () {
  	  return page
        .assertItems([])
  		  .assertMainSectionIsHidden()
  		  .assertFooterIsHidden();
  	});
  });

  describe('New Todo', function () {
    it('should allow me to add todo items', function () {
      return page
        .enterItem(TODO_ITEM_ONE)
        .assertItems([TODO_ITEM_ONE])
        .enterItem(TODO_ITEM_TWO)
        .assertItems([TODO_ITEM_ONE, TODO_ITEM_TWO]);
    });

    it('should clear text input field when an item is added', function () {
      return page
        .enterItem(TODO_ITEM_ONE)
        .assertItemInputFieldText('');
    });

    it('should append new items to the bottom of the list', function () {
      createStandardItems();
      return page
        .assertItems([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    });

    it('should trim text input', function () {
      return page
        .enterItem('   ' + TODO_ITEM_ONE + '  ')
        .assertItems([TODO_ITEM_ONE]);
    });

    it('should show #main and #footer when items added', function () {
      return page
        .enterItem(TODO_ITEM_ONE)
        .waitForAnimationFrame()
        .assertMainSectionIsVisible()
        .assertFooterIsVisible();
    });


  });
});
