(function (global) {

  "use strict";

  var maquette = global.maquette;

  var maquetteExtras = {

    // renderLoop which executes rendering synchronously. Added to be able to run performance tests.
    syncRenderLoop: function (element, renderFunction, options) {
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
        render: doRender
      };
    }
  };

  if (global.module !== undefined && global.module.exports) {
    // Node and other CommonJS-like environments that support module.exports
    global.module.exports = maquetteExtras;
  } else if (typeof global.define == 'function' && global.define.amd) {
    // AMD / RequireJS
    global.define(function () {
      return maquetteExtras;
    });
  } else {
    // Browser
    global['maquetteExtras'] = maquetteExtras;
  }

})(this);