(function (global) {

  "use strict";

  var maquette = global.maquette;

  var requestAnimationFrame =
    window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      function (callback) { window.setTimeout(callback, 16); };

  if(!maquette) {
    throw new Error("maquette must be loaded (first)");
  }

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
    nodeToRemove: function (node, properties) {
      var animation = properties.exitAnimation;
      if (animation) {
        init(node);
        var finished = false;
        var transitionEnd = function (evt) {
          if (!finished) {
            finished = true;
            node.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
            node.parentNode.removeChild(node);
          }
        };
        node.classList.add(animation);
        node.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
        requestAnimationFrame(function () {
          node.classList.add(animation + "-active");
        });
      } else {
        node.parentNode.removeChild(node);
      }
    },
    nodeAdded: function (node, properties) {
      var animation = properties.enterAnimation;
      if(animation) {
        init(node);
        var finished = false;
        var transitionEnd = function (evt) {
          if (!finished) {
            finished = true;
            node.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
            node.classList.remove(animation);
            node.classList.remove(animation + "-active");
          }
        };
        node.classList.add(animation);
        node.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
        requestAnimationFrame(function () {
          node.classList.add(animation + "-active");
        });
      }
    },
    nodeUpdated: function (node, type, name, newValue, oldValue) {
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