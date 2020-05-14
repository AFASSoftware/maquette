import { expect, sinon } from './test-utilities';
import { createProjector, h, MaquetteComponent, Projector } from '../src/index';
import * as path from 'path';

describe('Projector', () => {
  beforeEach(() => {
    global.requestAnimationFrame = sinon.stub().returns(5);
    global.cancelAnimationFrame = sinon.stub();
  });

  afterEach(() => {
    delete global.requestAnimationFrame;
    delete global.cancelAnimationFrame;
  });

  it('renders the virtual DOM immediately when adding renderFunctions', () => {
    let parentElement = {
      appendChild: sinon.stub(),
      insertBefore: sinon.stub(),
      ownerDocument: {
        createElement: sinon.spy((tag: string) => {
          return document.createElement(tag);
        })
      },
      removeChild: sinon.stub()
    };
    let renderFunction = sinon.stub().returns(
      h('div', [
        h('span')
      ])
    );
    let projector = createProjector({});

    // Append
    projector.append(parentElement as any, renderFunction);

    expect(renderFunction).to.have.been.calledOnce;
    expect(parentElement.ownerDocument.createElement).to.have.been.calledOnce;
    expect(parentElement.appendChild).to.have.been.calledOnce;
    expect(parentElement.appendChild.lastCall.args[0].tagName).to.equal('DIV');

    // InsertBefore
    let siblingElement = {
      parentNode: parentElement
    };

    projector.insertBefore(siblingElement as any, renderFunction);

    expect(renderFunction).to.have.been.calledTwice;
    expect(parentElement.insertBefore).to.have.been.calledOnce;
    expect(parentElement.insertBefore.lastCall.args[0].tagName).to.equal('DIV');
    expect(parentElement.insertBefore.lastCall.args[1]).to.equal(siblingElement);

    // Merge
    let cleanRenderFunction = sinon.stub().returns(
      h('div', [
        h('span')
      ])
    );

    let existingElement = {
      appendChild: sinon.stub(),
      ownerDocument: {
        createElement: sinon.spy((tag: string) => {
          return document.createElement(tag);
        })
      }
    };

    projector.merge(existingElement as any, cleanRenderFunction);

    expect(cleanRenderFunction).to.have.been.calledOnce;
    expect(existingElement.ownerDocument.createElement).to.have.been.calledOnce;
    expect(existingElement.appendChild).to.have.been.calledOnce;
    expect(existingElement.appendChild.lastCall.args[0].tagName).to.equal('SPAN');

    // Replace
    let oldElement = {
      parentNode: parentElement
    };

    projector.replace(oldElement as any, renderFunction);

    expect(renderFunction).to.have.been.calledThrice;
    expect(parentElement.removeChild).to.have.been.calledOnce;
    expect(parentElement.removeChild.lastCall.args[0]).to.equal(oldElement);
    expect(parentElement.insertBefore).to.have.been.calledTwice;
    expect(parentElement.insertBefore.lastCall.args[0].tagName).to.equal('DIV');
    expect(parentElement.insertBefore.lastCall.args[1]).to.equal(oldElement);

    // ScheduleRender

    projector.scheduleRender();
    expect(renderFunction).to.have.been.calledThrice;
    expect(global.requestAnimationFrame).to.have.been.calledOnce;
    global.requestAnimationFrame.callArg(0);
    expect(renderFunction).to.have.callCount(6);
  });

  it('Can stop and resume', () => {
    let projector = createProjector({});
    projector.scheduleRender();
    expect(global.requestAnimationFrame).to.have.been.calledOnce;
    global.requestAnimationFrame.callArg(0);

    // Stop
    projector.stop();
    projector.scheduleRender();
    expect(global.requestAnimationFrame).to.have.been.calledOnce;

    // Resume
    projector.resume();
    expect(global.requestAnimationFrame).to.have.been.calledTwice;
    global.requestAnimationFrame.callArg(0);

    // Stopping before rendering
    projector.scheduleRender();
    expect(global.requestAnimationFrame).to.have.been.calledThrice;
    projector.stop();
    expect(global.cancelAnimationFrame).to.have.been.calledOnce;
  });

  it('Stops when an error during rendering is encountered', () => {
    let projector = createProjector({});
    let parentElement = { appendChild: sinon.stub(), ownerDocument: document };
    let renderFunction = sinon.stub().returns(h('div'));
    projector.append(parentElement as any, renderFunction);
    renderFunction.throws('Rendering error');
    projector.scheduleRender();
    expect(() => {
      global.requestAnimationFrame.callArg(0);
    }).to.throw(Error);

    global.requestAnimationFrame.callArg(0);

    renderFunction.resetHistory();
    projector.scheduleRender();
    global.requestAnimationFrame.callArg(0);
    expect(renderFunction).not.to.be.called;

    global.requestAnimationFrame.resetHistory();
    renderFunction.returns(h('div'));
    projector.resume();
    global.requestAnimationFrame.callArg(0);
    expect(renderFunction).to.be.calledOnce;
  });

  it('schedules a render when event handlers are called', () => {
    let projector = createProjector({});
    let parentElement = { appendChild: sinon.stub(), ownerDocument: document };
    let handleClick = sinon.stub();
    let renderFunction = () => h('button', { onclick: handleClick });
    projector.append(parentElement as any, renderFunction);

    let button = parentElement.appendChild.lastCall.args[0] as HTMLElement;
    let evt = { currentTarget: button, type: 'click' } as object as MouseEvent;

    expect(global.requestAnimationFrame).not.to.be.called;

    button.onclick.apply(button, [evt]);

    expect(global.requestAnimationFrame).to.be.calledOnce;
    expect(handleClick).to.be.calledOn(button).calledWith(evt);
  });

  it('invokes the eventHandler with "this" set to the DOM node when no bind is present', () => {
    let parentElement = { appendChild: sinon.stub(), ownerDocument: document };
    let projector = createProjector({});
    let handleClick = sinon.stub();
    let renderFunction = () => h('button', { onclick: handleClick });
    projector.append(parentElement as any, renderFunction);

    let button = parentElement.appendChild.lastCall.args[0] as HTMLElement;
    let clickEvent = { currentTarget: button, type: 'click' };
    button.onclick(clickEvent as any);  // Invoking onclick like this sets 'this' to the ButtonElement

    expect(handleClick).to.be.calledOn(button).calledWithExactly(clickEvent);
  });

  describe('Event handlers', () => {
    /**
     * A class/prototype based implementation of a Component
     *
     * NOTE: This is not our recommended way, but this is completely supported (using VNodeProperties.bind).
     */
    class ButtonComponent implements MaquetteComponent {
      private text: string;
      private clicked: (sender: ButtonComponent) => void;

      constructor(buttonText: string, buttonClicked: (sender: ButtonComponent) => void) {
        this.text = buttonText;
        this.clicked = buttonClicked;
      }

      public render() {
        return h('button', { onclick: this.handleClick, bind: this }, [this.text]);
      }

      private handleClick(evt: MouseEvent) {
        this.clicked(this);
      }
    }

    it('invokes the eventHandler with "this" set to the value of the bind property', () => {
      let clicked = sinon.stub();
      let button = new ButtonComponent('Click me', clicked);

      let parentElement = { appendChild: sinon.stub(), ownerDocument: document };
      let projector = createProjector({});
      projector.append(parentElement as any, () => button.render());

      let buttonElement = parentElement.appendChild.lastCall.args[0] as HTMLElement;
      let clickEvent = { currentTarget: buttonElement, type: 'click' };
      buttonElement.onclick(clickEvent as any); // Invoking onclick like this sets 'this' to the ButtonElement

      expect(clicked).to.be.calledWithExactly(button);
    });

    let allowsForEventHandlersToBeChanged = (createProjectorImpl: (arg: any) => Projector) => {
      let projector = createProjectorImpl({});
      let parentElement = { appendChild: sinon.stub(), ownerDocument: document };
      let eventHandler = sinon.stub();

      let renderFunction = () => h('div', [
        h('span', [
          h('button', {
            onclick: eventHandler
          })
        ])
      ]);

      projector.append(parentElement as any, renderFunction);

      let div = parentElement.appendChild.lastCall.args[0] as HTMLElement;
      let button = div.firstChild.firstChild as HTMLElement;
      let evt = { currentTarget: button, type: 'click' } as object as MouseEvent;

      expect(eventHandler).to.have.not.been.called;
      button.onclick.apply(button, [evt]);
      expect(eventHandler).to.have.been.calledOnce;

      // Simulate changing the event handler
      eventHandler = sinon.stub();
      projector.renderNow();

      button.onclick.apply(button, [evt]);
      expect(eventHandler).to.have.been.calledOnce;
    };

    it('allows for eventHandlers to be changed', () => allowsForEventHandlersToBeChanged(createProjector));

    it('allows for eventHandlers to be changed on IE11', () => {
      let apFind = Array.prototype.find;
      try {
        delete Array.prototype.find;
        // re-require projector.ts
        delete require.cache[path.normalize(path.join(__dirname, '../src/projector.ts'))];
        let createProjectorImpl = require('../src/projector').createProjector;
        Array.prototype.find = apFind;
        allowsForEventHandlersToBeChanged(createProjectorImpl);
      } finally {
        Array.prototype.find = apFind;
      }
    });

    it('will not call event handlers on domNodes which are no longer part of the rendered VNode', () => {
      let buttonVisible = true;
      let buttonBlur = sinon.spy();
      let eventHandler = () => {
        buttonVisible = false;
      };
      let renderFunction = () => h('div', [
        buttonVisible ? [
          h('button', {
            onblur: buttonBlur,
            onclick: eventHandler
          })
        ] : []
      ]);

      let projector = createProjector({});
      let parentElement = document.createElement('section');
      projector.append(parentElement, renderFunction);
      let div = parentElement.firstChild as HTMLElement;
      let button = div.firstChild as HTMLButtonElement;
      button.onclick({ currentTarget: button, type: 'click' } as any);
      expect(buttonVisible).to.be.false;
      projector.renderNow();
      // In reality, during renderNow(), the blur event fires just before its parentNode is cleared.
      // To simulate this we recreate that state in a new button object.
      let buttonBeforeBeingDetached = {
        onblur: button.onblur as Function,
        parentNode: div
      };
      buttonBeforeBeingDetached.onblur({ currentTarget: buttonBeforeBeingDetached, type: 'blur' } as any);
      expect(buttonBlur).to.not.have.been.called;
    });

    it('will not call event handlers on domNodes which are detached, like in exotic cases in Safari', () => {
      let buttonVisible = true;
      let buttonBlur = sinon.spy();
      let eventHandler = () => {
        buttonVisible = false;
      };
      let renderFunction = () => h('div', [
        buttonVisible ? [
          h('button', {
            onblur: buttonBlur,
            onclick: eventHandler
          })
        ] : []
      ]);

      let projector = createProjector({});
      let parentElement = document.createElement('section');
      projector.append(parentElement, renderFunction);
      let div = parentElement.firstChild as HTMLElement;
      let button = div.firstChild as HTMLButtonElement;
      button.onclick({ currentTarget: button, type: 'click' } as any);
      expect(buttonVisible).to.be.false;
      projector.renderNow();
      button.remove();

      let detachedButton = {
        onblur: button.onblur as Function,
        parentNode: null as any
      };
      detachedButton.onblur({ currentTarget: detachedButton, type: 'blur' } as any);
      expect(buttonBlur).to.not.have.been.called;
    });

  });

  it('can detach a projection', () => {
    let parentElement = { appendChild: sinon.stub(), ownerDocument: document };
    let projector = createProjector({});
    let renderFunction = () => h('textarea#t1');
    let renderFunction2 = () => h('textarea#t2');
    projector.append(parentElement as any, renderFunction);
    projector.append(parentElement as any, renderFunction2);

    let projection = projector.detach(renderFunction);
    expect(projection.domNode.id).to.equal('t1');

    expect(() => {
      projector.detach(renderFunction);
    }).to.throw();
  });
});
