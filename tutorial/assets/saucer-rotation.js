var h = maquette.h;
var projector = maquette.createProjector();

var rotation = 45;

function renderMaquette() {
  return h("div.landscape", [
    h("div.saucer", {}, ["Flying saucer"])
  ]);
}

// Initializes the projector 
document.addEventListener('DOMContentLoaded', function () {
  projector.append(document.body, renderMaquette);
});