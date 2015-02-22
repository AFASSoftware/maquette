var h = maquette.h;

var rotation = 45;
var stealth = false;

function handleRotationInput(evt) {
  rotation = evt.target.value;
}

function handleStealthChange(evt) {
  evt.preventDefault();
  stealth = !stealth;
}

function renderMaquette() {
  return h("body", [
    h("div.landscape", [
      h("div.remote", {}, [
        h("div.function", [
          "rotation: ",
          h("input", { type: "text", value: rotation, oninput: handleRotationInput }),
          "degrees"
        ]),
        h("div.function", [
          "stealth: ",
          h("input", { type: "checkbox", checked: stealth, onchange: handleStealthChange })
        ])
    ]),
      h("div.saucer", {style:"transform:rotate("+rotation+"deg)", classes: {stealth: stealth} }, ["Flying saucer"])
    ])
  ]);
}

// Initializes the projector 
document.addEventListener('DOMContentLoaded', function () {
  maquette.createProjector(document.body, renderMaquette);
});