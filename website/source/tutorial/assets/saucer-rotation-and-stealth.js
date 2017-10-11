var h = maquette.h;
var projector = maquette.createProjector();

var rotation = 45;
var rotationVisible = true;
var stealth = false;

function handleRotationInput(evt) {
  rotation = evt.target.value;
}

function handleStealthChange(evt) {
  evt.preventDefault();
  stealth = !stealth;
}

function handleRemoveClick(evt) {
  rotationVisible = false;
}

function slideUp(element, removeElement) {
  Velocity.animate(element, 'slideUp', 1000, 'ease-out', removeElement);
}

function renderMaquette() {
  return h('div.landscape', [
    h('div.remote', {}, [
      rotationVisible ? [
        h('div.row', {exitAnimation: slideUp}, [
          'rotation: ',
          h('input', { type: 'text', value: rotation, oninput: handleRotationInput }),
          'degrees'
        ])
      ] : [],
      h('div.row', {exitAnimation: slideUp}, [
        'stealth: ',
        h('input', { type: 'checkbox', checked: stealth, onchange: handleStealthChange })
      ]),
      rotationVisible ? [
        h('button', {onclick: handleRemoveClick}, ['Remove rotation'])
      ] : []
    ]),
    h('div.saucer', {
      style: 'transform:rotate(' + rotation + 'deg)', classes: { stealth: stealth }
    })
  ]);
}

// Initializes the projector
document.addEventListener('DOMContentLoaded', function () {
  projector.append(document.body, renderMaquette);
});
