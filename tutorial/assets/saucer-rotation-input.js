var h = maquette.h;

var rotation = 45;

function handleRotationInput(evt) {
  rotation = evt.target.value;
}

function renderMaquette() {
  return h("body", [
    h("div.landscape", [
      h("div.remote", {}, [
        h("div.function", [
          "rotation: ",
          h("input", { type: "text" }),
          "degrees"
        ])
      ]),
      h("div.saucer", {style:"transform:rotate("+rotation+"deg)"}, ["Flying saucer"])
    ])
  ]);
}

// Initializes the projector 
document.addEventListener('DOMContentLoaded', function () {
  maquette.createProjector(document.body, renderMaquette);
});