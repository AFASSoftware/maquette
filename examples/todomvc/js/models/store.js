// This is just a copy of the vanilla implementation, rewritten without prototype
(function (window) {

  'use strict';

  /**
	 * Creates a new client side storage object and will create an empty
	 * collection if no collection already exists.
	 *
	 * @param {string} name The name of our DB we want to use
	 * NOTE: Our fake DB uses callbacks because in
	 * real life you probably would be making AJAX calls
	 */
  window.store = function (name) {
    var data;
    if (!localStorage[name]) {
      data = { todos: [] };
      localStorage[name] = JSON.stringify(data);
    } else {
      data = JSON.parse(localStorage[name]);
    }

    var flushTimeout = null;
    var flush = function () {
      if(!flushTimeout) {
        flushTimeout = setTimeout(function () {
          flushTimeout = null;
          localStorage[name] = JSON.stringify(data);
        });
      }
    };


    return {

      /**
       * Finds items based on a query given as a JS object
       *
       * @param {object} query The query to match against (i.e. {foo: 'bar'})
       * @param {function} callback	 The callback to fire when the query has
       * completed running
       *
       * @example
       * db.find({foo: 'bar', hello: 'world'}, function (data) {
       *	 // data will return any items that have foo: bar and
       *	 // hello: world in their properties
       * });
       */
      find: function (query, callback) {
        if (!callback) {
          return;
        }

        var todos = data.todos;

        callback.call(undefined, todos.filter(function (todo) {
          for (var q in query) {
            if (query[q] !== todo[q]) {
              return false;
            }
          }
          return true;
        }));
      },

      /**
       * Will retrieve all data from the collection
       *
       * @param {function} callback The callback to fire upon retrieving data
       */
      findAll: function (callback) {
        callback = callback || function () { };
        callback.call(undefined, data.todos);
      },

      /**
       * Will save the given data to the DB. If no item exists it will create a new
       * item, otherwise it'll simply update an existing item's properties
       *
       * @param {object} updateData The data to save back into the DB
       * @param {function} callback The callback to fire after saving
       * @param {number} id An optional param to enter an ID of an item to update
       */
      save: function (updateData, callback, id) {
        
        var todos = data.todos;

        callback = callback || function () { };

        // If an ID was actually given, find the item and update each property
        if (id) {
          for (var i = 0; i < todos.length; i++) {
            if (todos[i].id === id) {
              for (var key in updateData) {
                todos[i][key] = updateData[key];
              }
              break;
            }
          }

          flush();
          callback.call(undefined, data.todos);
        } else {
          // Generate an ID
          updateData.id = new Date().getTime();

          todos.push(updateData);
          flush();
          callback.call(undefined, [updateData]);
        }
      },

      /**
       * Will remove an item from the Store based on its ID
       *
       * @param {number} id The ID of the item you want to remove
       * @param {function} callback The callback to fire after saving
       */
      remove: function (id, callback) {
        var todos = data.todos;

        for (var i = 0; i < todos.length; i++) {
          if (todos[i].id == id) {
            todos.splice(i, 1);
            break;
          }
        }

        flush();
        callback.call(undefined, data.todos);
      },

      /**
       * Will drop all storage and start fresh
       *
       * @param {function} callback The callback to fire after dropping the data
       */
      drop: function (callback) {
        data = { todos: [] };
        flush();
        callback.call(undefined, data.todos);
      }

    };
  };
})(window);