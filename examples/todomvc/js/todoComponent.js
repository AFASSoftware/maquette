window.createTodoComponent = function (todoList, id, title) {

  'use strict';

  // Think of a component as being a View (the render() function) combined with a ViewModel (the rest).

  var h = window.domdirector.h;

  var renderCache = window.domdirector.createCache();

  var remove = function (evt) {
    evt.preventDefault();
    todoList.removeTodo(component);
  };

  var toggleClicked = function (evt) {
    evt.preventDefault();
    component.completed = !component.completed;
    todoList.todoCompletedUpdated(component, component.completed);
  };

  var component = {
    id: id,
    completed: false,
    render: function () {
      return renderCache.result([component.completed, title], function () {
        return h("li", { key: id, classes: { completed: component.completed } }, [
          h("div.view", [
            h("input.toggle", { type: "checkbox", checked: component.completed, onclick: toggleClicked }),
            h("label", [title]),
            h("button.destroy", { onclick: remove })
          ]),
          h("input.edit", { value: title })
        ]);
      });
    }
  };

  return component;
};
