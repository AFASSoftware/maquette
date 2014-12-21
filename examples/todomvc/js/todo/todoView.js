(function (window) {

  'use strict';

  var domdirector = window.domdirector;
  var h = domdirector.h;

  window.renderTodoView = function (vm) {

    return vm.renderCache.calculate([vm.completed, vm.title], function () {
      return h("li", { key: vm.id, classes: { completed: vm.completed } }, [
        h("div.view", [
          h("input.toggle", { type: "checkbox", checked: vm.completed, onclick: vm.toggleClicked }),
          h("label", [vm.title]),
          h("button.destroy", { onclick: vm.remove })
        ]),
        h("input.edit", { value: vm.title })
      ]);
    });

  };

})(window);
