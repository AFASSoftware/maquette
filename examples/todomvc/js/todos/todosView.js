(function (window) {

  'use strict';

  var domsetter = window.domsetter;
  var h = domsetter.h;

  window.renderTodosView = function (vm) {
    var anyTodos = vm.todos.length > 0;

    return h("section#todoapp", [
      h("header#header", [
        h("h1", ["todos"]),
        h("input#new-todo", { autofocus: true, placeholder: "What needs to be done?", onkeypress: vm.newTodoKeypress, oninput: vm.newTodoInput, value: vm.newTodoTitle })
      ]),
      anyTodos ? [
        h("section#main", [
          h("input#toggle-all", { type: "checkbox", checked: vm.checkedAll, onclick: vm.checkedAllClicked }),
          h("label", { htmlFor: "toggle-all" }, ["Mark all as complete"]),
          h("ul#todo-list",
            vm.todos.map(window.renderTodoView)
          )
        ]),
        h("footer#footer", {}, [
          h("span#todo-count", {}, [
            h("strong", [vm.itemsLeft]), vm.itemsLeft === 1 ? " item left" : " items left"
          ]),
          h("ul#filters", {}, [
            h("li", { key: "selected" }[
              h("a.selected", { href: "#" }, ["All"])
            ]),
            h("li", { key: "active" }, [
              h("a", { href: "#" }, ["Active"])
            ]),
            h("li", { key: "completed" }, [
              h("a", { href: "#" }, ["Completed"])
            ])
          ]),
          vm.completedCount > 0 ? h("button#clear-completed", {}, ["Clear completed (" + vm.completedCount + ")"]) : null
        ])
      ] : null
    ]);
  };
})(window);
