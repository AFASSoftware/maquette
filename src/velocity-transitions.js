(function (global) {

  "use strict";

  var domplotter = global.domplotter;
  var velocity = (global.jQuery || global.Zepto || global).Velocity;
  var noop = function () { };

  if(!domplotter || !velocity) {
    throw new Error("domplotter and velocity must be loaded (first)");
  }

  var velocityTransitions = {
    nodeToRemove: function (node, properties) {
      var animation = properties.exitAnimation;
      if(animation) {
        velocity.animate(node, animation, {
          complete: function () {
            node.parentNode.removeChild(node);
          }
        });
      } else {
        node.parentNode.removeChild(node);
      }
    },
    nodeAdded: function (node, properties) {
      var animation = properties.enterAnimation;
      if(animation) {
        velocity.animate(node, animation);
      }
    },
    nodeUpdated: function (node, type, name, newValue, oldValue) {
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
  } else {
    // Browser
    global['velocityTransitions'] = velocityTransitions;
  }

})(this);