window.createProgressiveEnhancer = function (renderFunctionsByQuerySelector) {
  var renderFunctions = [];
  var projections = [];

  var afterCreate = function (domNode, projectionOptions) {
    Object.keys(renderFunctionsByQuerySelector).forEach(function (querySelector) {
      var target = domNode.querySelector(querySelector);
      if (!target) {
        throw new Error("Could not find: " + querySelector);
      }
      var renderFunction = renderFunctionsByQuerySelector[querySelector];
      renderFunctions.push(renderFunction);
      projections.push(maquette.mergeDom(target, renderFunction(), projectionOptions));
    });
  };

  var afterUpdate = function () {
    for (var i = 0; i < renderFunctions.length; i++) {
      projections[i].update(renderFunctions[i]());
    }
  };

  return {
    renderMaquette: function () {
      return maquette.h("body", { // body is just a placeholder, it will be ignored by maquette.mergeDom
        afterCreate: afterCreate,
        afterUpdate: afterUpdate
      });
    }
  };
};
