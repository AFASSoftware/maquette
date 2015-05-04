(function (window) {

  'use strict';

  var maquette = window.maquette;

  // Using the vanilla JS implementation for Model and Store, nothing special here
  var model = new window.model(new window.store("todomvc-maquette"));

  var router = window.createRouter(model);

  document.addEventListener('DOMContentLoaded', function () {
    var projector = maquette.createProjector(document.getElementsByTagName("main")[0], router.renderMaquette, {});
    window.onhashchange = function (evt) {
      projector.scheduleRender();
    };
  });

})(window);
