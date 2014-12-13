window.createTodoViewModel = function (todosViewModel, id, title) {

  'use strict';

  var vm = {

    id: id,
    title: title,
    completed: false,

    remove: function (evt) {
      evt.preventDefault();
      todosViewModel.todos.splice(todosViewModel.todos.indexOf(vm), 1);
    }

  };

  return vm;
};
