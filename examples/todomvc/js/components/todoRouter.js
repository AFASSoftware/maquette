window.createRouter = function (model) {
  // This router renders a <main> in which the current page is rendered. The current page is based on the hash (#) part of the url.

  'use strict';

  var h = window.maquette.h;

  var currentHash = null;
  var currentPage = null;

  var todoRouter = {

    renderMaquette: function () {
      var hash = document.location.hash;

      if(hash !== currentHash) {
        switch(hash) {
          case "#/active":
            currentPage = createListComponent("active", model);
            break;
          case "#/completed":
            currentPage = createListComponent("completed", model);
            break;
          default:
            currentPage = createListComponent("all", model);
        }
        currentHash = hash;
      }

      return h("main", [
        currentPage.renderMaquette()
      ]);
    }
  };

  return todoRouter;
};
