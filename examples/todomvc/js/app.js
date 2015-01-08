(function (window) {

  'use strict';

  var maquette = window.maquette;

  // Using the vanilla JS implementation for Model and Store, nothing special here
  var model = new window.model(new window.store("todomvc-maquette"));

  var router = window.todoRouter(model);

  document.addEventListener('DOMContentLoaded', function() {
    var renderLoop = maquette.renderLoop(document.getElementsByTagName("main")[0], router.render, { /* No render options */ });
    window.onhashchange = function (evt) {
      renderLoop.scheduleRender();
    };
  });

})(window);
