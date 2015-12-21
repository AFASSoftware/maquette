var h = maquette.h;
var projector = maquette.createProjector();

var remote = createRemote(); // createRemote is defined in remote.js

function renderMaquette() {
  return h('div.landscape', [
    remote.renderMaquette(),
    h('div.saucer', {
      style: 'transform:' + remote.getSaucerStyle()
    })
  ]);
}

// Initializes the projector 
document.addEventListener('DOMContentLoaded', function () {
  projector.append(document.body, renderMaquette);
});
