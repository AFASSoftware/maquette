(function (window) {

  'use strict';

  var domdirector = window.domdirector;

  // Using the vanilla JS implementation for Model and Store, nothing special here
  var model = new window.model(new window.store("todomvc-domdirector"));

  var router = window.todoRouter(model);

  document.addEventListener('DOMContentLoaded', function() {
    var renderLoop = domdirector.renderLoop(document.getElementsByTagName("main")[0], router.render, { /* No render options */ });
    window.onhashchange = function (evt) {
      renderLoop.scheduleRender();
    };
  });

})(window);
