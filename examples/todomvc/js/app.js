(function (window) {

  'use strict';

  var domdirector = window.domdirector;

  // Using the vanilla JS implementation for Model and Store, nothing special here
  var model = new app.Model(new app.Store("todomvc-domdirector"));

  var router = window.todoRouter({ model: model });

  document.addEventListener('DOMContentLoaded', function() {
    var renderLoop = domdirector.renderLoop(document.getElementById("todoapp"), router.render, { /* No render options */ });
    window.onhashchange = function (evt) {
      renderLoop.scheduleRender();
    };
  });

})(window);
