(function (window) {

  'use strict';

  var domplotter = window.domplotter;

  // Using the vanilla JS implementation for Model and Store, nothing special here
  var model = new window.model(new window.store("todomvc-domplotter"));

  var router = window.todoRouter(model);

  document.addEventListener('DOMContentLoaded', function() {
    var renderLoop = domplotter.renderLoop(document.getElementsByTagName("main")[0], router.render, { /* No render options */ });
    window.onhashchange = function (evt) {
      renderLoop.scheduleRender();
    };
  });

})(window);
