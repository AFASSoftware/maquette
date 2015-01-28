var webdriver = require('selenium-webdriver');
var Q = require('q');
var expect = require("chai").expect;

module.exports = function (browser, chain) {

  chain = chain
    .waitForElementByCss('#new-todo');

  var getItemInputField = function () {
    return chain.waitForElementByCss('#new-todo');
  };

  var getItemTexts = function () {
    return browser
      .elementsByCss("#todo-list li label")
      .then(function (labels) {
        return Q.all(labels.map(function (label) {
          return label.text();
        }));
    });
  };

  var waitForAnimationFrame = function () {
    chain = chain.executeAsync("window.requestAnimationFrame(arguments[arguments.length - 1]);");
    return page;
  };

  var page = {
    waitForAnimationFrame: waitForAnimationFrame,
    assertFocussedElementId: function (expectedId) {
      return browser.waitForConditionInBrowser("document.activeElement.id === '"+expectedId+"'");
    },
    enterItem: function (itemText) {
      chain = getItemInputField()
        .sendKeys(itemText)
        .sendKeys(webdriver.Key.ENTER);
      return page;
    },
    assertItems: function (itemTexts) {
      waitForAnimationFrame();
      chain = chain
        .then(function () {
          return getItemTexts().then(function (foundTexts) {
            expect(foundTexts.length).to.equal(itemTexts.length);
            for (var i = 0; i < itemTexts.length; i++) {
              expect(foundTexts[i]).to.equal(itemTexts[i]);
            }
          });
        });
      return page;
    },
    assertMainSectionIsHidden: function () {
      chain = chain
        .elementsByCss("#main")
        .then(function (elements) { expect(elements.length).to.equal(0); });
      return page;
    },
    assertFooterIsHidden: function () {
      chain = chain
        .elementsByCss("#footer")
        .then(function (elements) { expect(elements.length).to.equal(0); });
      return page;
    },
    assertMainSectionIsVisible: function () {
      chain = chain
        .elementsByCss("#main")
        .then(function (elements) { expect(elements.length).to.equal(1); });
      return page;
    },
    assertFooterIsVisible: function () {
      chain = chain
        .elementsByCss("#footer")
        .then(function (elements) { expect(elements.length).to.equal(1); });
      return page;
    },
    assertItemInputFieldText: function (text) {
      chain = getItemInputField()
        .getAttribute("value").should.become(text);
      return page;
    },

    then: function (onFulfilled, onRejected) {
      chain = chain.then(onFulfilled, onRejected);
      return page;
    }
  };

  return page;
};