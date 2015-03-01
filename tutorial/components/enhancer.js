window.createProgressiveEnhancer = function (renderFunctionsByQuerSelector) {
  var renderFunctions = [];
  var projections = [];

  var afterCreate = function (domNode, projectionOptions) {
    Object.keys(renderFunctionsByQuerSelector).forEach(function (querySelector) {
      var target = domNode.querySelector(querySelector);
      if (!target) {
        throw new Error("Could not find: " + querySelector);
      }
      var renderFunction = renderFunctionsByQuerSelector[querySelector];
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
      return maquette.h("body", {
        afterCreate: afterCreate,
        afterUpdate: afterUpdate
      });
    }
  };
};
