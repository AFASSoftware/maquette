(function( window ) {
  'use strict';
  var domsetter = window.domsetter;
  var h = domsetter.h;

  var lastId = 0;

  var completedCount = 0;
  var itemsLeft = 0;
  var todos = [];
  var newTodoTitle = "";

  // logic
  var addTodo = function () {
    todos.push({
      id: ++lastId,
      title: newTodoTitle,
      completed:false
    });
    itemsLeft++;
  };

  // event handlers
  var newTodoKeyup = function (evt) {
    if (evt.keyCode === 13 /* Enter */) {
      addTodo();
      newTodoTitle = "";
      evt.preventDefault();
    } else if(evt.keyCode === 27 /* Esc */) {
      newTodoTitle = "";
      evt.preventDefault();
    } else {
      newTodoTitle = evt.target.value;
    }
  };
  
  var render = function () {

    return h("section#todoapp", [
      h("header#header", [
        h("h1", ["todos"]),
        h("input#new-todo", { autofocus: true, placeholder: "What needs to be done?", onkeyup: newTodoKeyup, value: newTodoTitle })
      ]),
      h("section#main", [
        h("input#toggle-all", { type: "checkbox" }),
        h("label", {htmlFor:"toggle-all"}, ["Mark all as complete"]),
        h("ul#todo-list", [
          todos.map(function (todo) {
            return h("li", {key: todo.id, classes: {completed: todo.completed} }, [
              h("div.view", [
                h("input.toggle", { type: "checkbox" }),
                h("label", [todo.title]),
                h("button.destroy")
              ]),
              h("input.edit", { value: todo.title })
            ]);
          })
        ])
      ]),
      h("footer#footer", {}, [
        h("span#todo-count", {}, [
          h("strong", [itemsLeft]), itemsLeft===1?"item left":"items left"
        ]),
        h("ul#filters", {}, [
          h("li", {key:"selected"} [
            h("a.selected", { href: "#" }, ["All"])
          ]),
          h("li", { key: "active" }, [
            h("a", { href: "#" }, ["Active"])
          ]),
          h("li", { key: "completed" }, [
            h("a", { href: "#" }, ["Completed"])
          ])
        ]),
        h("button#clear-completed", {}, ["Clear completed ("+completedCount+")"])
      ])
    ]);
  };

  var main = null;

  document.addEventListener('DOMContentLoaded', function() {
    main = domsetter.renderLoop(document.getElementById("todoapp"), render, {});
  });

})( window );
