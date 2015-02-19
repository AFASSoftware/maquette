var h = maquette.h;

var rotation = 45;

function renderMaquette() {
  return h("body", [
    h("div.landscape", [
      h("div.saucer", {}, ["Flying saucer"])
    ])
  ]);
}

// Initializes the projector 
document.addEventListener('DOMContentLoaded', function () {
  maquette.createProjector(document.body, renderMaquette);
});