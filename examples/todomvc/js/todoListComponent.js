window.createTodoListComponent = function () {

  'use strict';

  // Think of a component as being a View (the render() function) combined with a ViewModel (the rest).

  var lastId = 0;
  var h = window.domdirector.h;


  var checkedAll = true;
  var completedCount = 0;
  var itemsLeft = 0;
  var newTodoTitle = "";
  var todos = [];

  var addTodo = function () {
    var title = newTodoTitle.trim();
    if (title) {
      var todo = createTodoComponent(component, ++lastId, newTodoTitle);
      todos.push(todo);
      itemsLeft++;
      checkedAll = false;
    }
  };

  // event handlers

  var newTodoKeypress = function (evt) {
    newTodoTitle = evt.target.value;
    if(evt.keyCode === 13 /* Enter */) {
      addTodo();
      newTodoTitle = "";
      evt.preventDefault();
    } else if(evt.keyCode === 27 /* Esc */) {
      newTodoTitle = "";
      evt.preventDefault();
    }
  };
  
  var newTodoInput = function (evt) {
    newTodoTitle = evt.target.value;
  };

  var checkedAllClicked = function (evt) {
    evt.preventDefault();
    checkedAll = !checkedAll;
    todos.forEach(function (todo) {
      todo.completed = checkedAll;
    });
    itemsLeft = 0;
    completedCount = todos.length;
  };

  var component = {

    // public interface (accessible from app and todoComponent)

    removeTodo: function (todo) {
      todos.splice(todos.indexOf(todo), 1);
      if(todo.completed) {
        completedCount--;
      } else {
        itemsLeft--;
      }
    },

    todoCompletedUpdated: function (todo, completed) {
      if(completed) {
        completedCount++;
        checkedAll = completedCount === todos.length;
        itemsLeft--;
      } else {
        completedCount--;
        checkedAll = false;
        itemsLeft++;
      }
    },

    render: function () {
      var anyTodos = todos.length > 0;

      return h("section#todoapp", [
        h("header#header", [
          h("h1", ["todos"]),
          h("input#new-todo", { autofocus: true, placeholder: "What needs to be done?", onkeypress: newTodoKeypress, oninput: newTodoInput, value: newTodoTitle })
        ]),
        anyTodos ? [
          h("section#main", [
            h("input#toggle-all", { type: "checkbox", checked: checkedAll, onclick: checkedAllClicked }),
            h("label", { htmlFor: "toggle-all" }, ["Mark all as complete"]),
            h("ul#todo-list",
              todos.map(function (todo) { return todo.render(); })
            )
          ]),
          h("footer#footer", {}, [
            h("span#todo-count", {}, [
              h("strong", [itemsLeft]), itemsLeft === 1 ? " item left" : " items left"
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
            completedCount > 0 ? h("button#clear-completed", {}, ["Clear completed (" + completedCount + ")"]) : null
          ])
        ] : null
      ]);
    }
  };

  return component;
};
