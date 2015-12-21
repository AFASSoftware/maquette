(function () {
  var h = maquette.h;

  // Creates a new *remote* component
  window.createRemote = function () {

    var rowComponents = [];

    var handleAddClick = function (evt) {
      evt.preventDefault();
    };

    var remote = {
      getSaucerStyle: function () {
        return rowComponents.map(function (f) { return f.getSaucerStyle(); }).join(' ');
      },
      hasTransform: function (transform) {
        return rowComponents.some(function (f) {
          return f.getTransform() === transform;
        });
      },
      renderMaquette: function () {
        return h('div.remote', {}, [
          rowComponents.map(function (f) {
            return f.renderMaquette();
          }),
          rowComponents.some(function (row) {
             return !row.getSaucerStyle();
          }) || rowComponents.length == 7 ? [
            // Do not show the add button when there are still empty rows
          ] : [
            h('button.add', { onclick: handleAddClick }, ['+'])
          ]
        ]);
      }
    };

    // Initialize with one row
    rowComponents.push(createRemoteRow(remote, 'rotate', '0'));

    return remote;
  };

}());
