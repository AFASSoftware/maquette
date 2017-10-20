var h = maquette.h;
var projector = maquette.createProjector();

function render() {
  return h('div.landscape', [
    /* childnodes can be inserted here */
  ]);
}

// Initializes the projector
document.addEventListener('DOMContentLoaded', function () {
  projector.append(document.body, render);
});
