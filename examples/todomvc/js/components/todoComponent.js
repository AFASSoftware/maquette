window.todoComponent = function (todoList, id, title) {

  'use strict';

  // Think of a component as being a View (the render() function) combined with a ViewModel (the rest).

  var h = window.maquette.h;
  var ENTER_KEY = 13;
  var ESC_KEY = 27;

  var renderCache = window.maquette.createCache();
  var editingTitle = null;

  var remove = function (evt) {
    evt.preventDefault();
    todoList.removeTodo(component);
  };

  var toggleClicked = function (evt) {
    evt.preventDefault();
    component.completed = !component.completed;
    todoList.todoCompletedUpdated(component, component.completed);
  };

  var labelDoubleClicked = function (evt) {
    editingTitle = component.title;
    todoList.editTodo(component);
    evt.preventDefault();
  };

  var editInputHandler = function (evt) {
    editingTitle = evt.target.value;
  };

  var acceptEdit = function () {
    component.title = editingTitle.trim();
    if (!component.title) {
      todoList.editTodo(null);
      todoList.removeTodo(component);
    } else {
      todoList.todoTitleUpdated(component);
      todoList.editTodo(null);
      editingTitle = null;
    }
  };

  var editKeyup = function (evt) {
    if (evt.keyCode == ENTER_KEY) {
      acceptEdit();
    }
    if (evt.keyCode == ESC_KEY) {
      todoList.editTodo(null);
      editingTitle = null;
    }
  };

  var editBlurred = function (evt) {
    if (todoList.editingTodo === component) {
      acceptEdit();
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

  var component = {
    id: id,
    title: title,
    completed: false,

    render: function () {
      var editing = todoList.editingTodo === component;

      return renderCache.result([component.completed, component.title, editing], function () {
        return h("li", { key: id, classes: { completed: component.completed, editing: editing } }, [
          editing
            ? h("input.edit", { value: editingTitle, oninput: editInputHandler, onkeyup: editKeyup, onblur: editBlurred, afterCreate: focusEdit })
            : h("div.view", [
                h("input.toggle", { type: "checkbox", checked: component.completed, onclick: toggleClicked }),
                h("label", { ondblclick: labelDoubleClicked }, [component.title]),
                h("button.destroy", { onclick: remove })
              ])
        ]);
      });
    }
  };

  return component;
};
