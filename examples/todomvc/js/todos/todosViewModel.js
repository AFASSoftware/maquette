window.createTodosViewModel = function () {

  'use strict';

  var lastId = 0;

  var addTodo = function () {
    var todo = createTodoViewModel(vm, ++lastId, vm.newTodoTitle);
    vm.todos.push(todo);
    vm.itemsLeft++;
  };

  var vm = {

    // public interface

    completedCount: 0,
    itemsLeft: 0,
    newTodoTitle: "",
    todos: [],

    newTodoKeyup: function (evt) {
      if (evt.keyCode === 13 /* Enter */) {
        addTodo();
        vm.newTodoTitle = "";
        evt.preventDefault();
      } else if (evt.keyCode === 27 /* Esc */) {
        vm.newTodoTitle = "";
        evt.preventDefault();
      } else {
        vm.newTodoTitle = evt.target.value;
      }
    }
  };

  return vm;
};
