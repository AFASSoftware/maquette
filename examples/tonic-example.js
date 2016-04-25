// This example can be viewed online at https://tonicdev.com/npm/maquette and demonstrates unit testing in NodeJS

let {h} = require("maquette");

var yourName = ''; // Piece of data

// Plain event handler
function handleNameInput(evt) {
  yourName = evt.target.value;
}

// This function uses the 'hyperscript' notation to create the virtual DOM. 
function renderMaquette() {
  return h('div', [
    h('input', { 
      type: 'text', placeholder: 'What is your name?', 
      value: yourName, oninput: handleNameInput 
    }),
    h('p.output', ['Hello ' + (yourName || 'you') + '!'])
  ]);
}

// Query the result using maquette-query

let {createTestProjector} = require("maquette-query");

let testProjector = createTestProjector(renderMaquette);
let output = testProjector.query('.output');

output.textContent;