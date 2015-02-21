var h = maquette.h;

var rotation = 0;
var x = -150;
var y = 0;
var startDate = new Date().getTime();
var projector;

function handleRotationInput(evt) {
  rotation = evt.target.value;
}

function tick() {
  var moment = (new Date().getTime() - startDate)/1000;
  x = Math.round(150 * Math.sin(moment));
  y = Math.round(150 * Math.cos(moment));
  requestAnimationFrame(tick);
}

function renderMaquette() {
  return h("body", [
    h("div.landscape", [
      h("div.remote", {}, [
        h("div.function", [
          "rotation: ",
          h("input.slider", { type: "range", min:"-45", max:"45", value: rotation, oninput: handleRotationInput, onchange: handleRotationInput })
        ])
      ]),
      h("div.planet", [
        h("div.saucer", { style: "transform:translate(" + x + "px," + y + "px) rotate(" + rotation + "deg)" }, ["Flying saucer"])
      ])
    ])
  ]);
}

// Initializes the projector 
document.addEventListener('DOMContentLoaded', function () {
  projector = maquette.createProjector(document.body, renderMaquette);
  tick();
});