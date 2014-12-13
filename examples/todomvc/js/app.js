(function (window) {

  'use strict';

  var domsetter = window.domsetter;

  var viewModel = window.createTodosViewModel();

  document.addEventListener('DOMContentLoaded', function() {
    domsetter.renderLoop(document.getElementById("todoapp"), function () {
      return window.renderTodosView(viewModel);
    }, { /* No render options */ });
  });

})(window);
