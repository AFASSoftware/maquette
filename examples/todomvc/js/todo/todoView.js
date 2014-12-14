(function (window) {

  'use strict';

  var domsetter = window.domsetter;
  var h = domsetter.h;

  window.renderTodoView = function (vm) {

    return h("li", { key: vm.id, classes: { completed: vm.completed } }, [
      h("div.view", [
        h("input.toggle", { type: "checkbox", checked: vm.completed, onclick: vm.toggleClicked }),
        h("label", [vm.title]),
        h("button.destroy", { onclick: vm.remove })
      ]),
      h("input.edit", { value: vm.title })
    ]);

  };

})(window);
