(function () {
  var h = maquette.h;

  window.createRemote = function () {

    var rows = [];

    var handleAddClick = function (evt) {
      evt.preventDefault();
      rows.push(createRemoteRow(remote)); // TODO
    };

    var remote = {
      getSaucerStyle: function () {
        return rows.map(function (f) { return f.getSaucerStyle(); }).join(" ");
      },
      hasTransform: function (transform) {
        return rows.some(function (f) {
          return f.getTransform() === transform;
        });
      },
      renderMaquette: function () {
        return h("div.remote", {}, [
          rows.map(function (f) {
            return f.renderMaquette();
          }),
          rows.some(function (row) {
             return !row.getSaucerStyle();
          }) || rows.length == 7 ? [
            // Do not show the add button when there are still empty rows
          ] : [
            h("button.add", { onclick: handleAddClick }, ["+"])
          ]
        ]);
      }
    };

    // Initialize with one row
    rows.push(createRemoteRow(remote));

    return remote;
  };

}());
