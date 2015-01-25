(function (global) {

  "use strict";

  var maquette = global.maquette;

  var maquetteExtras = {

    // projector which executes rendering synchronously (immediately). Created to be able to run performance tests.
    createSyncProjector: function (element, renderFunction, options) {
      var patchedOptions = {};
      Object.keys(options).forEach(function (key) {
        patchedOptions[key] = options[key];
      });
      patchedOptions.eventHandlerInterceptor = function (propertyName, functionPropertyArgument) {
        return function () {
          var result = functionPropertyArgument.apply(this, arguments);
          doRender();
          return result;
        };
      };
      var mount = null;
      var doRender = function () {
        if (!mount) {
          var vnode = renderFunction();
          mount = maquette.mergeDom(element, vnode, patchedOptions);
        } else {
          var updatedVnode = renderFunction();
          mount.update(updatedVnode);
        }
      };
      doRender();
      return {
        scheduleRender: doRender
      };
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    // Node and other CommonJS-like environments that support module.exports
    module.exports = maquetteExtras;
  } else if (typeof define === "function" && define.amd) {
    // AMD / RequireJS
    define(function () {
      return maquetteExtras;
    });
  } else {
    // Browser
    window.maquetteExtras = maquetteExtras;
  }

})(this);