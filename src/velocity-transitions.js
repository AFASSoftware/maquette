(function (global) {

  "use strict";

  var velocity = (global.jQuery || global.Zepto || global).Velocity;

  if(!velocity) {
    throw new Error("Velocity must be loaded (first)");
  }

  var velocityTransitions = {
    exit: function (node, properties, exitAnimation, removeNode) {
      velocity.animate(node, exitAnimation, removeNode);
    },
    enter: function (node, properties, enterAnimation) {
      velocity.animate(node, enterAnimation);
    }
  };

  if (global.module !== undefined && global.module.exports) {
    // Node and other CommonJS-like environments that support module.exports
    global.module.exports = velocityTransitions;
  } else if (typeof global.define == 'function' && global.define.amd) {
    // AMD / RequireJS
    global.define(function () {
      return velocityTransitions;
    });
  }
  if (window) {
    // Browser
    window.velocityTransitions = velocityTransitions;
  }

})(this);
