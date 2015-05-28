window.createTodoComponent = function (message) {
  var h = maquette.h;

  var completed = false;

  var handleCompletedClick = function (evt) {
    evt.preventDefault();
    completed = !completed;
  };

  return {
    isCompleted: function () {
      return completed;
    },
    renderMaquette: function () {
      return h("todo-component", [
        h("div.message", [message]),
        h("input", { type: "checkbox", checked: completed, onclick: handleCompletedClick })
      ]);
    }
  };
};
