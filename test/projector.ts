import {expect, sinon, jsdom} from './utilities';
import {createProjector, h, Component} from '../src/maquette';

describe('Projector', () => {

  beforeEach(function() {
    global.requestAnimationFrame = sinon.stub().returns(5);
    global.cancelAnimationFrame = sinon.stub();
  });

  afterEach(function() {
    delete global.requestAnimationFrame;
    delete global.cancelAnimationFrame;
  });

  jsdom();

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
    expect(parentElement.appendChild.lastCall.args[0]).to.deep.include({ tagName: 'DIV' });

    // InsertBefore
    let siblingElement = {
      parentNode: parentElement
    };

    projector.insertBefore(siblingElement as any, renderFunction);

    expect(renderFunction).to.have.been.calledTwice;
    expect(parentElement.insertBefore).to.have.been.calledOnce;
    expect(parentElement.insertBefore.lastCall.args[0]).to.deep.include({ tagName: 'DIV' });
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
    expect(existingElement.appendChild.lastCall.args[0]).to.deep.include({ tagName: 'SPAN' });

    // Replace
    let oldElement = {
      parentNode: parentElement
    };

    projector.replace(oldElement as any, renderFunction);

    expect(renderFunction).to.have.been.calledThrice;
    expect(parentElement.removeChild).to.have.been.calledOnce;
    expect(parentElement.removeChild.lastCall.args[0]).to.equal(oldElement);
    expect(parentElement.insertBefore).to.have.been.calledTwice;
    expect(parentElement.insertBefore.lastCall.args[0]).to.deep.include({ tagName: 'DIV' });
    expect(parentElement.insertBefore.lastCall.args[1]).to.equal(oldElement);

    // ScheduleRender

    projector.scheduleRender();
    expect(renderFunction).to.have.been.calledThrice;
    expect(global.requestAnimationFrame).to.have.been.calledOnce;
    global.requestAnimationFrame.callArg(0);
    expect(renderFunction).to.have.callCount(6);
  });

  it('can reuse existing dom', () => {
    let parentNode = {
      tagName: 'DIV'
    };
    let childNode = {
      onclick: function () { },
      ownerDocument: {
        createElement: sinon.spy((tag: string) => {
          return document.createElement(tag);
        })
      },
      tagName: 'SPAN',
      textContent: undefined
    };
    let handleClick = sinon.stub();
    let renderFunction = sinon.stub().returns({
      vnodeSelector: 'div',
      properties: {},
      children: [ {
        vnodeSelector: 'span',
        properties: { onclick: handleClick },
        children: undefined,
        text: 'text',
        domNode: childNode
      } ],
      text: undefined,
      domNode: null
    });
    let projector = createProjector({});

    projector.merge(parentNode as any, renderFunction);

    childNode.onclick();
    expect(handleClick).to.have.been.calledOnce;
    expect(childNode.textContent).to.equal('text');
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

    renderFunction.reset();
    projector.scheduleRender();
    global.requestAnimationFrame.callArg(0);
    expect(renderFunction).not.to.be.called;

    global.requestAnimationFrame.reset();
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
    let evt = {};

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
    let clickEvent = {};
    button.onclick(clickEvent as any);  // Invoking onclick like this sets 'this' to the ButtonElement

    expect(handleClick).to.be.calledOn(button).calledWithExactly(clickEvent);
  });

  /**
   * A class/prototype based implementation of a Component
   *
   * NOTE: This is not our recommended way, but this is completely supported (using VNodeProperties.bind).
   */
  class ButtonComponent implements Component {

    private text: string;
    private clicked: (sender: ButtonComponent) => void;

    constructor(buttonText: string, buttonClicked: (sender: ButtonComponent) => void) {
      this.text = buttonText;
      this.clicked = buttonClicked;
    }

    public renderMaquette() {
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
    projector.append(parentElement as any, () => button.renderMaquette());

    let buttonElement = parentElement.appendChild.lastCall.args[0] as HTMLElement;
    let clickEvent = {};
    buttonElement.onclick(clickEvent as any); // Invoking onclick like this sets 'this' to the ButtonElement

    expect(clicked).to.be.calledWithExactly(button);
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
