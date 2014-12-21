(function (window) {

  'use strict';

  var domdirector = window.domdirector;

  var viewModel = window.createTodosViewModel();

  document.addEventListener('DOMContentLoaded', function() {
    domdirector.renderLoop(document.getElementById("todoapp"), function () {
      return window.renderTodosView(viewModel);
    }, { /* No render options */ });
  });

})(window);
