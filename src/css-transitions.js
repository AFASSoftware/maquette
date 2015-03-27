(function (global) {

  "use strict";

  var browserSpecificTransitionEndEventName = null;

  var determineBrowserSpecificStyleNames = function (element) {
    if ("WebkitTransition" in element.style) {
      browserSpecificTransitionEndEventName = "webkitTransitionEnd";
    } else if ("transition" in element.style) {
      browserSpecificTransitionEndEventName = "transitionend";
    } else if ("MozTransition" in element.style) {
      browserSpecificTransitionEndEventName = "transitionend";
    } else {
      throw new Error("Your browser is not supported");
    }
  };

  var init = function (testElement) {
    if (browserSpecificTransitionEndEventName === null) {
      determineBrowserSpecificStyleNames(testElement);
    }
  };

  var cssTransitions = {
    exit: function (node, properties, exitAnimation, removeNode) {
      init(node);
      var finished = false;
      var transitionEnd = function (evt) {
        if (!finished) {
          finished = true;
          node.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
          removeNode();
        }
      };
      node.classList.add(exitAnimation);
      node.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
      requestAnimationFrame(function () {
        node.classList.add(exitAnimation + "-active");
      });
    },
    enter: function (node, properties, enterAnimation) {
      init(node);
      var finished = false;
      var transitionEnd = function (evt) {
        if (!finished) {
          finished = true;
          node.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
          node.classList.remove(enterAnimation);
          node.classList.remove(enterAnimation + "-active");
        }
      };
      node.classList.add(enterAnimation);
      node.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
      requestAnimationFrame(function () {
        node.classList.add(enterAnimation + "-active");
      });
    }
  };

  if (global.module !== undefined && global.module.exports) {
    // Node and other CommonJS-like environments that support module.exports
    global.module.exports = cssTransitions;
  } else if (typeof global.define == 'function' && global.define.amd) {
    // AMD / RequireJS
    global.define(function () {
      return cssTransitions;
    });
  }
  if (window) {
    // Browser
    window.cssTransitions = cssTransitions;
  }

})(this);
