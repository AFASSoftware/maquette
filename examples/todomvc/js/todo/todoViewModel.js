window.createTodoViewModel = function (todosViewModel, id, title) {

  'use strict';

  var vm = {

    id: id,
    title: title,
    completed: false,

    remove: function (evt) {
      evt.preventDefault();
      todosViewModel.removeTodo(vm);
    },

    toggleClicked: function (evt) {
      evt.preventDefault();
      vm.completed = !vm.completed;
      todosViewModel.todoCompletedUpdated(vm, vm.completed);
    }

  };

  return vm;
};
