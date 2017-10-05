import { expect, sinon } from '../test-utilities';
import { dom, h } from '../../src/index';

let noopEventHandlerInterceptor = (propertyName: string, functionPropertyArgument: Function) => {
  return function(this: Node) {
    /* tslint:disable no-invalid-this */
    return functionPropertyArgument.apply(this, arguments);
    /* tslint:enable no-invalid-this */
  };
};

describe('dom', () => {
  describe('properties', () => {
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

      it('allows a constant class to be applied to make JSX workable', () => {
        let projection = dom.create(h('div', { class: 'extra special' }));
        expect(projection.domNode.outerHTML).to.equal('<div class="extra special"></div>');
        projection.update(h('div', { class: 'extra special' }));
        expect(() => {
          // updating class is not allowed, use 'classes' for this
          projection.update(h('div', { class: '' }));
        }).to.throw(Error);
      });

      it('allows classes and class to be combined', () => {
        let projection = dom.create(h('div', { classes: { extra: true }, class: 'special' }));
        expect(projection.domNode.outerHTML).to.equal('<div class="extra special"></div>');
        projection.update(h('div', { classes: { extra: false }, class: 'special' }));
        expect(projection.domNode.outerHTML).to.equal('<div class="special"></div>');
      });

      it('helps to prevent mistakes when using className', () => {
        expect(() => {
          dom.create(h('div', { className: 'special' }));
        }).to.throw(Error);
      });

    });

    it('updates attributes', () => {
      let projection = dom.create(h('a', { href: '#1' }));
      let link = projection.domNode as HTMLLinkElement;
      expect(link.getAttribute('href')).to.equal('#1');

      projection.update(h('a', { href: '#2' }));
      expect(link.getAttribute('href')).to.equal('#2');

      projection.update(h('a', { href: undefined }));
      expect(link.getAttribute('href')).to.equal('');
    });

    it('can add an attribute that was initially undefined', () => {
      let projection = dom.create(h('a', { href: undefined }));
      let link = projection.domNode as HTMLLinkElement;
      expect(link.getAttribute('href')).to.be.null;

      projection.update(h('a', { href: '#2' }));
      expect(link.getAttribute('href')).to.equal('#2');
    });

    it('can remove disabled property when set to null or undefined', () => {
      let projection = dom.create(h('a', { disabled: true }));
      let link = projection.domNode as HTMLLinkElement;

      expect(link.disabled).to.equal(true);
      // Unfortunately JSDom does not map the property value to the attribute as real browsers do
      // expect(link.getAttribute('disabled')).to.equal('');

      projection.update(h('a', <any>{ disabled: null }));

      // What Chrome would do:
      // expect(link.disabled).to.equal(false);
      // expect(link.getAttribute('disabled')).to.be.null;

      // What JSDom does:
      expect(link.disabled).to.be.null;
    });

    it('updates properties', () => {
      let projection = dom.create(h('a', { href: '#1', tabIndex: 1 }));
      let link = projection.domNode as HTMLLinkElement;
      expect(link.tabIndex).to.equal(1);

      projection.update(h('a', { href: '#1', tabIndex: 2 }));
      expect(link.tabIndex).to.equal(2);

      projection.update(h('a', { href: '#1', tabIndex: undefined }));
      expect(link.tabIndex).to.equal(0);
    });

    it('updates innerHTML', () => {
      let projection = dom.create(h('p', { innerHTML: '<span>INNER</span>' }));
      let paragraph = projection.domNode as HTMLElement;
      expect(paragraph.childNodes).to.have.length(1);
      expect(paragraph.firstChild!.textContent).to.equal('INNER');
      projection.update(h('p', { innerHTML: '<span>UPDATED</span>' }));
      expect(paragraph.childNodes).to.have.length(1);
      expect(paragraph.firstChild!.textContent).to.equal('UPDATED');
    });

    it('does not mess up scrolling in Edge', () => {
      let projection = dom.create(h('div', { scrollTop: 0 }));
      let div = projection.domNode as HTMLDivElement;
      Object.defineProperty(div, 'scrollTop', {
        get: () => 1,
        set: sinon.stub().throws('Setting scrollTop would mess up scrolling')
      }); // meaning: div.scrollTop = 1;
      projection.update(h('div', { scrollTop: 1 }));
    });

    it('sets HTMLInputElement.type before the element is added to the DOM for IE8 and earlier', () => {
      let parentNode = {
        appendChild: sinon.spy((child: HTMLElement) => {
          expect(child.getAttribute('type')).to.equal('file');
        }),
        ownerDocument: {
          createElement: sinon.spy((tag: string) => {
            return document.createElement(tag);
          })
        }
      };
      dom.append(<any>parentNode, h('input', { type: 'file' }));
      expect(parentNode.appendChild).to.have.been.called;
      expect(parentNode.ownerDocument.createElement).to.have.been.called;
    });

    describe('event handlers', () => {
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

    it('updates the value property', () => {
      let typedKeys = '';
      let handleInput = (evt: Event) => {
        typedKeys = (evt.target as HTMLInputElement).value;
      };

      let renderFunction = () => h('input', { value: typedKeys, oninput: handleInput });
      let projection = dom.create(renderFunction(), { eventHandlerInterceptor: noopEventHandlerInterceptor });
      let inputElement = (projection.domNode as HTMLInputElement);
      expect(inputElement.value).to.equal(typedKeys);
      typedKeys = 'value1';
      projection.update(renderFunction());
      expect(inputElement.value).to.equal(typedKeys);
    });

    it('does not clear a value that was set by a testing tool (like Ranorex) which manipulates input.value directly', () => {
      let typedKeys = '';
      let handleInput = (evt: Event) => {
        typedKeys = (evt.target as HTMLInputElement).value;
      };

      let renderFunction = () => h('input', { value: typedKeys, oninput: handleInput });

      let projection = dom.create(renderFunction(), { eventHandlerInterceptor: noopEventHandlerInterceptor });
      let inputElement = (projection.domNode as HTMLInputElement);
      expect(inputElement.value).to.equal(typedKeys);

      inputElement.value = 'value written by a testing tool without invoking the input event';

      projection.update(renderFunction());
      expect(inputElement.value).not.to.equal(typedKeys); // no resetting should have taken place
    });

    it('Can handle oninput event handlers which pro-actively change element.value to correct user input when typing faster than 60 keys per second', () => {
      let model = '';
      let handleInput = (evt: Event) => {
        let element = evt.target as HTMLInputElement;
        model = element.value;
        if (model.indexOf(',') > 0) {
          model = model.replace(/,/g, '.');
          element.value = model; // To allow a user to type faster than 60 keys per second
          // in reality, selectionStart would now also be reset
        }
      };

      let renderFunction = () => h('input', { value: model, oninput: handleInput });
      let projection = dom.create(renderFunction(), { eventHandlerInterceptor: noopEventHandlerInterceptor });

      let inputElement = (projection.domNode as HTMLInputElement);
      expect(inputElement.value).to.equal(model);

      inputElement.value = '4';
      inputElement.oninput({ target: inputElement } as any as Event);
      projection.update(renderFunction());

      inputElement.value = '4,';
      inputElement.oninput({ target: inputElement } as any as Event);
      projection.update(renderFunction());

      expect(inputElement.value).to.equal('4.');

      model = '';
      projection.update(renderFunction());

      expect(inputElement.value).to.equal('');
    });

    it('removes the attribute when a role property is set to undefined', () => {
      let role: string | undefined = 'button';
      let renderFunction = () => h('div', { role: role });

      let projection = dom.create(renderFunction(), { eventHandlerInterceptor: noopEventHandlerInterceptor });
      let element = projection.domNode;

      expect(element.attributes).to.have.property('role');
      expect(element.getAttribute('role')).to.equal(role);

      role = undefined;
      projection.update(renderFunction());
      expect(element.attributes).to.not.have.property('role');
    });
  });

});
