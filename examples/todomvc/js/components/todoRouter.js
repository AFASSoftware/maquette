window.todoRouter = function () {

  'use strict';

  var h = window.domdirector.h;

  var currentPage = null;

  var component = {

    render: function () {
      var hash = document.location.hash;
      var mode;
      switch (hash) {
        case "#/active":
          mode = "active";
          break;
        case "#/completed":
          mode = "completed";
          break;
        default:
          mode = "all";
      };
      if(!currentPage || currentPage.mode !== mode) {
        currentPage = todoListComponent(mode);
      }
      return  currentPage.render();
    }
  };

  return component;
};
