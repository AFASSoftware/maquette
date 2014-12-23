window.todoListComponent = function (mode) {

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
      var todo = todoComponent(component, ++lastId, newTodoTitle);
      todos.push(todo);
      itemsLeft++;
      checkedAll = false;
    }
  };

  var visibleInMode = function (todo) {
    switch(mode) {
      case "completed":
        return todo.completed === true;
      case "active":
        return todo.completed !== true;
      default:
        return true;
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

    // public interface (accessible from both app and todoComponent)

    mode: mode,

    editingTodo: null,

    removeTodo: function (todo) {
      todos.splice(todos.indexOf(todo), 1);
      if(todo.completed) {
        completedCount--;
      } else {
        itemsLeft--;
      }
    },

    editTodo: function (todo) {
      component.editingTodo = todo;
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
        h("header#header", { key: mode }, [
          h("h1", ["todos"]),
          h("input#new-todo", { autofocus: true, placeholder: "What needs to be done?", onkeypress: newTodoKeypress, oninput: newTodoInput, value: newTodoTitle })
        ]),
        anyTodos ? [
          h("section#main", { key: mode }, [
            h("input#toggle-all", { type: "checkbox", checked: checkedAll, onclick: checkedAllClicked }),
            h("label", { htmlFor: "toggle-all" }, ["Mark all as complete"]),
            h("ul#todo-list",
              todos.filter(visibleInMode).map(function (todo) { return todo.render(); })
            )
          ]),
          h("footer#footer", {key: mode}, [
            h("span#todo-count", {}, [
              h("strong", [itemsLeft]), itemsLeft === 1 ? " item left" : " items left"
            ]),
            h("ul#filters", {}, [
              h("li", { key: "selected" }[
                h("a.selected", { href: "#/all" }, ["All"])
              ]),
              h("li", { key: "active" }, [
                h("a", { href: "#/active" }, ["Active"])
              ]),
              h("li", { key: "completed" }, [
                h("a", { href: "#/completed" }, ["Completed"])
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
