(function (global) {

  "use strict";

  var programmaticTransitions = {
    nodeToRemove: function (node, properties) {
      if(properties) {
        var animation = properties.exitAnimation;
        if(animation) {
          animation(node, function () {
            if(node.parentNode) {
              node.parentNode.removeChild(node);
            }
          }, properties);
          return;
        }
      }
      node.parentNode.removeChild(node);
    },
    nodeAdded: function (node, properties) {
      if(properties) {
        var animation = properties.enterAnimation;
        if(animation) {
          animation(node, properties);
        }
      }
    },
    nodeUpdated: function (node, properties, type, name, newValue, oldValue) {
      if(properties) {
        var animation = properties.updateAnimation;
        if(animation) {
          animation(node, properties, type, name, newValue, oldValue);
        }
      }
    }
  };

  if (global.module !== undefined && global.module.exports) {
    // Node and other CommonJS-like environments that support module.exports
    global.module.exports = programmaticTransitions;
  } else if (typeof global.define == 'function' && global.define.amd) {
    // AMD / RequireJS
    global.define(function () {
      return programmaticTransitions;
    });
  }
  if (window) {
    // Browser
    window.programmaticTransitions = programmaticTransitions;
  }

})(this);
