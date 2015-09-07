window.createTodoComponent = function (todoList, id, title) {

  'use strict';

  // Think of a component as being a View (the renderMaquette() function) combined with a ViewModel (the rest).

  var h = window.maquette.h;
  var ENTER_KEY = 13;
  var ESC_KEY = 27;

  // State

  var renderCache = window.maquette.createCache(); // We use a cache here just for demonstration purposes, performance is usually not an issue at all.
  var editingTitle = null;

  // Helper functions

  var acceptEdit = function () {
    todoComponent.title = editingTitle.trim();
    if(!todoComponent.title) {
      todoList.editTodo(null);
      todoList.removeTodo(todoComponent);
    } else {
      todoList.todoTitleUpdated(todoComponent);
      todoList.editTodo(null);
      editingTitle = null;
    }
  };

  var focusEdit = function (domNode) {
    if(window.setImmediate) {
      window.setImmediate(function () { // IE weirdness
        domNode.focus();
        domNode.selectionStart = 0;
        domNode.selectionEnd = domNode.value.length;
      });
    } else {
      domNode.focus();
      domNode.selectionStart = 0;
      domNode.selectionEnd = domNode.value.length;
    }
  };

  // Event handlers

  var handleDestroyClick = function (evt) {
    evt.preventDefault();
    todoList.removeTodo(todoComponent);
  };

  var handleToggleClick = function (evt) {
    evt.preventDefault();
    todoComponent.completed = !todoComponent.completed;
    todoList.todoCompletedUpdated(todoComponent, todoComponent.completed);
  };

  var handleLabelDoubleClick = function (evt) {
    editingTitle = todoComponent.title;
    todoList.editTodo(todoComponent);
    evt.preventDefault();
  };

  var handleEditInput = function (evt) {
    editingTitle = evt.target.value;
  };

  var handleEditKeyUp = function (evt) {
    if (evt.keyCode == ENTER_KEY) {
      acceptEdit();
    }
    if (evt.keyCode == ESC_KEY) {
      todoList.editTodo(null);
      editingTitle = null;
    }
  };

  var handleEditBlur = function (evt) {
    if (todoList.editingTodo === todoComponent) {
      acceptEdit();
    }
  };

  // Public API of this component

  var todoComponent = {
    id: id,
    title: title,
    completed: false,

    renderMaquette: function () {
      var editing = todoList.editingTodo === todoComponent;

      return renderCache.result([todoComponent.completed, todoComponent.title, editing], function () {
        return h("li", { key: todoComponent, classes: { completed: todoComponent.completed, editing: editing } },
          editing ? [
            h("input.edit", { value: editingTitle, oninput: handleEditInput, onkeyup: handleEditKeyUp, onblur: handleEditBlur, afterCreate: focusEdit })
          ] : [
            h("div.view",
              h("input.toggle", { type: "checkbox", checked: todoComponent.completed, onclick: handleToggleClick }),
              h("label", { ondblclick: handleLabelDoubleClick }, todoComponent.title),
              h("button.destroy", { onclick: handleDestroyClick })
            )
          ]
        );
      });
    }
  };

  return todoComponent;
};
