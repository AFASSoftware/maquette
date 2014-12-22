(function (window) {

  'use strict';

  var domdirector = window.domdirector;

  var rootComponent = window.createTodoListComponent();

  document.addEventListener('DOMContentLoaded', function() {
    domdirector.renderLoop(document.getElementById("todoapp"), function () {
      return rootComponent.render();
    }, { /* No render options */ });
  });

})(window);
