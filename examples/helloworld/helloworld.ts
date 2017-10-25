import { h } from '../../src/h';
import { createProjector } from '../../src/projector';
import { performanceObserverProjectorLogger } from '../../src/utilities/performanceobserver-projector-logger';

document.addEventListener('DOMContentLoaded', () => {
  // Data
  let name = '';

  // Event handler for the 'input' event on the 'name' input
  let nameInput = (evt: Event) => {
    name = (evt.target as HTMLInputElement).value;
  };

  // Renders the virtual DOM
  let render = () => {
    return h('body', [
      h('p.input', [
        h('span', ['What is your name? ']),
        h('input', { type: 'text', autofocus: true, value: name, oninput: nameInput })
      ]),
      name ? [
        h('p.output', [`Hello ${name}!`])
      ] : []
    ]);
  };

  // Starts the projector, which renders the virtual DOM at the right moments
  createProjector({ performanceLogger: performanceObserverProjectorLogger }).merge(document.body, render);

});
