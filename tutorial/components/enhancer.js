window.createProgressiveEnhancer = function (componentsByQuerSelector) {
  var components = [];
  var renderings = [];

  var afterCreate = function (domNode, projectionOptions) {
    Object.keys(componentsByQuerSelector).forEach(function (querySelector) {
      var target = domNode.querySelector(querySelector);
      if (!target) {
        throw new Error("Could not find: " + querySelector);
      }
      var component = componentsByQuerSelector[querySelector];
      components.push(component);
      renderings.push(maquette.mergeDom(target, component.renderMaquette(), projectionOptions));
    });
  };

  var afterUpdate = function () {
    for (var i = 0; i < renderings.length; i++) {
      renderings[i].update(components[i].renderMaquette());
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
