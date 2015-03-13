var h = maquette.h;

var remote = createRemote();

function renderMaquette() {
  return h("body", [
    h("div.landscape", [
      remote.renderMaquette(),
      h("div.saucer", {
        style: "transform:"+remote.getSaucerStyle() 
      }, [
        "Flying saucer"
      ])
    ])
  ]);
}

// Initializes the projector 
document.addEventListener('DOMContentLoaded', function () {
  maquette.createProjector(document.body, renderMaquette);
});
