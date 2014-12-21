(function (global) {

  "use strict";

  var domdirector = global.domdirector;
  var velocity = (global.jQuery || global.Zepto || global).Velocity;
  var noop = function () { };

  if(!domdirector || !velocity) {
    throw new Error("domdirector and velocity must be loaded (first)");
  }

  var velocityTransitions = {
    nodeToRemove: function (node) {
      var animation = node.exitAnimation;
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
    nodeAdded: function (node) {
      var animation = node.enterAnimation;
      if (animation) {
        velocity.animate(node, animation);
      }
    },
    nodeUpdated: noop
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