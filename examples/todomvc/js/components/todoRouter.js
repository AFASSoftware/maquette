window.todoRouter = function (model) {

  'use strict';

  var h = window.maquette.h;

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
        currentPage = todoListComponent(mode, model);
      }
      return h("main", [currentPage.render()]);
    }
  };

  return component;
};
