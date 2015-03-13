(function () {
  var h = maquette.h;

  window.createRemote = function () {

    var functions = [];

    var handleAddClick = function (evt) {
      evt.preventDefault();
      functions.push(createRemoteFunction(remote));
    };

    var remote = {
      getSaucerStyle: function () {
        return functions.map(function (f) { return f.getSaucerStyle(); }).join(" ");
      },
      isTransformAvailable: function (transform) {
        return !functions.some(function (f) {
          return f.getTransform() === transform;
        });
      },
      renderMaquette: function () {
        return h("div.remote", {}, [
          functions.map(function (f) {
            return f.renderMaquette();
          }),
          h("button.add", { onclick: handleAddClick}, ["+"])
        ]);
      }
    };

    functions.push(createRemoteFunction(remote));

    return remote;
  };

}());
