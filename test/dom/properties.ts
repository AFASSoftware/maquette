import {expect, jsdom} from '../utilities';
import {h, dom} from '../../src/maquette';

let noopEventHandlerInterceptor = (propertyName: string, functionPropertyArgument: Function) => {
  return function() {
    return functionPropertyArgument.apply(this, arguments);
  };
};


describe('dom', function() {

  describe('properties', function() {

    jsdom();

    describe('classes', () => {

      it('adds and removes classes', () => {
        let projection = dom.create(h('div', { classes: { a: true, b: false } }));
        let div = projection.domNode as HTMLDivElement;
        expect(div.className).to.equal('a');

        projection.update(h('div', { classes: { a: true, b: true } }));
        expect(div.className).to.equal('a b');

        projection.update(h('div', { classes: { a: false, b: true } }));
        expect(div.className).to.equal('b');
      });

      it('helps to prevent mistakes when using class or className', () => {
        expect(() => {
          dom.create(h('div', { class: 'special' }));
        }).to.throw(Error);

        expect(() => {
          dom.create(h('div', { className: 'special' }));
        }).to.throw(Error);

      });

    });

    it('allows one to correct the value while being typed', () => {
      // Here we are trying to trim the value to 2 characters
      let typedKeys = '';
      let handleInput = (evt: Event) => {
        typedKeys = (evt.target as HTMLInputElement).value.substr(0, 2);
      };
      let renderFunction = () => h('input', { value: typedKeys, oninput: handleInput });
      let projection = dom.create(renderFunction(), { eventHandlerInterceptor: noopEventHandlerInterceptor });
      let inputElement = (projection.domNode as HTMLInputElement);
      expect(inputElement.value).to.equal(typedKeys);

      // No correction
      inputElement.value = 'ab';
      inputElement.oninput({ target: inputElement } as any);
      expect(typedKeys).to.equal('ab');
      projection.update(renderFunction());
      expect(inputElement.value).to.equal('ab');

      // Correction kicking in
      inputElement.value = 'abc';
      inputElement.oninput({ target: inputElement } as any);
      expect(typedKeys).to.equal('ab');
      projection.update(renderFunction());
      expect(inputElement.value).to.equal('ab');
    });

    it('does not undo keystrokes, even if a browser runs an animationFrame between changing the value property and running oninput', () => {
      // Crazy internet explorer behavior
      let typedKeys = '';
      let handleInput = (evt: Event) => {
        typedKeys = (evt.target as HTMLInputElement).value;
      };

      let renderFunction = () => h('input', { value: typedKeys, oninput: handleInput });

      let projection = dom.create(renderFunction(), { eventHandlerInterceptor: noopEventHandlerInterceptor });
      let inputElement = (projection.domNode as HTMLInputElement);
      expect(inputElement.value).to.equal(typedKeys);

      // Normal behavior
      inputElement.value = 'a';
      inputElement.oninput({ target: inputElement } as any);
      expect(typedKeys).to.equal('a');
      projection.update(renderFunction());

      // Crazy behavior
      inputElement.value = 'ab';
      projection.update(renderFunction()); // renderFunction still produces value:'a'
      expect(typedKeys).to.equal('a');
      expect(inputElement.value).to.equal('ab');
      inputElement.oninput({ target: inputElement } as any);
      expect(typedKeys).to.equal('ab');
      projection.update(renderFunction());
    });

  });

});
