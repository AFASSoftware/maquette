window.todoListComponent = function (mode, model) {

  'use strict';

  // Think of a component as being a View (the render() function) combined with a ViewModel (the rest).

  var h = window.maquette.h;

  var checkedAll = true;
  var completedCount = 0;
  var itemsLeft = 0;
  var newTodoTitle = "";
  var todos = [];

  var addTodo = function () {
    var title = newTodoTitle.trim();
    if (title) {
      model.create(newTodoTitle, function (results) {
        var todo = todoComponent(component, results[0].id, results[0].title);
        todos.push(todo);
        itemsLeft++;
        checkedAll = false;
      });
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
      if(todo.completed !== checkedAll) {
        todo.completed = checkedAll;
        model.update(todo.id, { title: todo.title, completed: checkedAll });
      }
    });
    if(checkedAll) {
      itemsLeft = 0;
      completedCount = todos.length;
    } else {
      itemsLeft = todos.length;
      completedCount = 0;
    }
  };

  var clearCompletedClicked = function (evt) {
    for(var i = todos.length - 1; i >= 0; i--) {
      if(todos[i].completed) {
        component.removeTodo(todos[i]);
      }
    }
  };

  var component = {

    // public interface (accessible from both app and todoComponent)

    mode: mode,

    editingTodo: null,

    removeTodo: function (todo) {
      model.remove(todo.id, function () {
        todos.splice(todos.indexOf(todo), 1);
        if (todo.completed) {
          completedCount--;
        } else {
          itemsLeft--;
          checkedAll = completedCount === todos.length;
        }
      });
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
      model.update(todo.id, { title: todo.title, completed: completed });
    },

    todoTitleUpdated: function (todo) {
      model.update(todo.id, { title: todo.title, completed: todo.completed });
    },

    render: function () {
      var anyTodos = todos.length > 0;

      return h("section#todoapp", {key: mode}, [
        h("header#header", [
          h("h1", ["todos"]),
          h("input#new-todo", { autofocus: true, placeholder: "What needs to be done?", onkeypress: newTodoKeypress, oninput: newTodoInput, value: newTodoTitle })
        ]),
        anyTodos ? [
          h("section#main", { key: mode }, [
            h("input#toggle-all", { type: "checkbox", checked: checkedAll, onclick: checkedAllClicked }),
            h("label", { "for": "toggle-all" }, ["Mark all as complete"]),
            h("ul#todo-list",
              todos.filter(visibleInMode).map(function (todo) { return todo.render(); })
            )
          ]),
          h("footer#footer", [
            h("span#todo-count", {}, [
              h("strong", [itemsLeft]), itemsLeft === 1 ? " item left" : " items left"
            ]),
            h("ul#filters", {}, [
              h("li", { key: "all" }, [
                h("a", { classes: {selected: mode === "all"}, href: "#/all" }, ["All"])
              ]),
              h("li", { key: "active" }, [
                h("a", { classes: { selected: mode === "active" }, href: "#/active" }, ["Active"])
              ]),
              h("li", { key: "completed" }, [
                h("a", { classes: { selected: mode === "completed" }, href: "#/completed" }, ["Completed"])
              ])
            ]),
            completedCount > 0 ? h("button#clear-completed", { onclick: clearCompletedClicked }, ["Clear completed (" + completedCount + ")"]) : null
          ])
        ] : null
      ]);
    }
  };

  model.read(function (data) {
    data.forEach(function (dataItem) {
      var todo = todoComponent(component, dataItem.id, dataItem.title);
      todos.push(todo);
      if(dataItem.completed) {
        todo.completed = true;
        completedCount++;
      } else {
        itemsLeft++;
        checkedAll = false;
      }
    });
  });

  return component;
};
