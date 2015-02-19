var h = maquette.h;

function renderMaquette() {
  return h("body", [
    h("div.landscape", [])
  ]);
}

// Initializes the projector 
document.addEventListener('DOMContentLoaded', function () {
  maquette.createProjector(document.body, renderMaquette);
});