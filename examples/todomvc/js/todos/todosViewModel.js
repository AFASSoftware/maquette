window.createTodosViewModel = function () {

  'use strict';

  var lastId = 0;

  var addTodo = function () {
    var title = vm.newTodoTitle.trim();
    if (title) {
      var todo = createTodoViewModel(vm, ++lastId, vm.newTodoTitle);
      vm.todos.push(todo);
      vm.itemsLeft++;
      vm.checkedAll = false;
    }
  };

  var vm = {

    // public interface

    checkedAll: true,
    completedCount: 0,
    itemsLeft: 0,
    newTodoTitle: "",
    todos: [],

    newTodoKeypress: function (evt) {
      vm.newTodoTitle = evt.target.value;
      if (evt.keyCode === 13 /* Enter */) {
        addTodo();
        vm.newTodoTitle = "";
        evt.preventDefault();
      } else if (evt.keyCode === 27 /* Esc */) {
        vm.newTodoTitle = "";
        evt.preventDefault();
      }
    },

    newTodoInput: function (evt) {
      vm.newTodoTitle = evt.target.value;
    },

    checkedAllClicked: function (evt) {
      evt.preventDefault();
      var checkedAll = vm.checkedAll = !vm.checkedAll;
      vm.todos.forEach(function (todo) {
        todo.completed = checkedAll;
      });
      vm.itemsLeft = 0;
      vm.completedCount = vm.todos.length;
    },

    removeTodo: function (todo) {
      vm.todos.splice(vm.todos.indexOf(todo), 1);
      if(todo.completed) {
        vm.completedCount--;
      } else {
        vm.itemsLeft--;
      }
    },

    todoCompletedUpdated: function (todo, completed) {
      if(completed) {
        vm.completedCount++;
        vm.checkdAll = vm.completedCount === vm.todos.length;
        vm.itemsLeft--;
      } else {
        vm.completedCount--;
        vm.checkedAll = false;
        vm.itemsLeft++;
      }
    }
  };

  return vm;
};
