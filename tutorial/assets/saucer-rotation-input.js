var h = maquette.h;
var projector = maquette.createProjector();

var rotation = 45;

function handleRotationInput(evt) {
  rotation = evt.target.value;
}

function renderMaquette() {
  return h("div.landscape", [
    h("div.remote", {}, [
      h("div.row", [
        "rotation: ",
        h("input", { type: "text" }),
        "degrees"
      ])
    ]),
    h("div.saucer", { style: "transform:rotate(" + rotation + "deg)" }, [
      "Flying saucer"
    ])
  ]);
}

// Initializes the projector 
document.addEventListener('DOMContentLoaded', function () {
  projector.append(document.body, renderMaquette);
});