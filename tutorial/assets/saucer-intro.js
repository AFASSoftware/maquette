var h = maquette.h;
var projector = maquette.createProjector();

function renderMaquette() {
  return h("div.landscape", []);
}

// Initializes the projector 
document.addEventListener('DOMContentLoaded', function () {
  projector.append(document.body, renderMaquette);
});