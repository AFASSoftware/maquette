(function () {
  var h = maquette.h;

  var newTodoText = "Your next todo";
  var todos = [
    createTodoComponent("TODO item after enhancement")
  ];

  // Event handlers

  var handleNewTodoInput = function (evt) {
    newTodoText = evt.target.value;
  };

  var handleNewTodoButtonClick = function (evt) {
    evt.preventDefault();
    if(newTodoText) {
      todos.splice(0, 0, createTodoComponent(newTodoText));
      newTodoText = "";
      // ... and imagine we post the new todo to the server using XHR
    }
  };

  // Enhance functions

  var enhanceNewTodoText = function () {
    return h("input", { value: newTodoText, oninput: handleNewTodoInput });
  };

  var enhanceNewTodoButton = function () {
    return h("input", { type: "submit", onclick: handleNewTodoButtonClick });
  };

  var enhanceTodoList = function () {
    return h("ul#todo-list", [
      todos.map(function (todo) {
        return h("li", {key:todo}, [
          todo.renderMaquette()
        ]);
      })
    ]);
  };

  // Put it all in motion
  document.addEventListener('DOMContentLoaded', function () {
    var projector = maquette.createProjector();
    projector.merge(document.getElementById("new-todo-text"), enhanceNewTodoText);
    projector.merge(document.getElementById("new-todo-button"), enhanceNewTodoButton);
    projector.replace(document.getElementById("todo-list"), enhanceTodoList);
    projector.evaluateHyperscript(document.body, { todos: todos });
  });

})();