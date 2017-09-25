var h = maquette.h;
var projector = maquette.createProjector();

var rotation = 0;
var x = -150;
var y = 0;
var startDate = new Date().getTime();

function handleRotationInput(evt) {
  rotation = evt.target.value;
}

// This function continually adjusts the saucer position
function tick() {
  var moment = (new Date().getTime() - startDate)/1000;
  x = Math.round(150 * Math.sin(moment));
  y = Math.round(150 * Math.cos(moment));
  requestAnimationFrame(tick);
}

function renderMaquette() {
  return h('div.landscape', [
    h('div.remote', {}, [
      h('div.row', [
        'rotation: ',
        h('input.slider', { type: 'range', min:'-45', max:'45', value: rotation, oninput: handleRotationInput, onchange: handleRotationInput })
      ])
    ]),
    h('div.planet', [
      h('div.saucer', { style: 'transform:translate(' + x + 'px,' + y + 'px) rotate(' + rotation + 'deg)' })
    ])
  ]);
}

// Initializes the projector 
document.addEventListener('DOMContentLoaded', function () {
  projector.append(document.body, renderMaquette);
  tick();
});