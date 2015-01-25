(function (window) {

  'use strict';

  var maquette = window.maquette;

  // Using the vanilla JS implementation for Model and Store, nothing special here
  var model = new window.model(new window.store("todomvc-maquette"));

  var router = window.todoRouter(model);

  document.addEventListener('DOMContentLoaded', function () {
    var sync = !!window.location.href.match(/[?&]sync/);
    var createProjector = sync ? maquetteExtras.createSyncProjector : maquette.createProjector;
    var projector = createProjector(document.getElementsByTagName("main")[0], router.render, {});
    window.onhashchange = function (evt) {
      projector.scheduleRender();
    };
  });

})(window);
