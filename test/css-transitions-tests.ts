import {cssTransitions} from '../src/css-transitions';
import {expect, sinon} from './test-utilities';

describe('CSS Transitions', () => {

  beforeEach(() => {
    global.requestAnimationFrame = sinon.stub();
  });

  afterEach(() => {
    delete global.requestAnimationFrame;
  });

  let activeModifier = '-active';

  let createFakeElement = function () {
    return {
      style: {
        transition: null as any
      },
      addEventListener: sinon.stub(),
      removeEventListener: sinon.stub(),
      classList: {
        add: sinon.stub(),
        remove: sinon.stub()
      },
    };
  };

  it('it applies active modifier to enterAnimation class on enter()', () => {
    let element = createFakeElement();
    let props = {};
    let animationClass = 'enter';

    cssTransitions.enter(element as any, props, animationClass);

    expect(element.classList.add).to.be.calledOnce;
    expect(element.classList.add.lastCall.args[0]).to.equal(animationClass);

    let transitionEnd = element.addEventListener.getCall(0).args[1];

    expect(transitionEnd).to.be.a('function');

    expect(element.addEventListener).to.have.been.calledTwice;
    expect(element.addEventListener).calledWith('transitionend', transitionEnd);
    expect(element.addEventListener).calledWith('animationend', transitionEnd);

    let addModifier = global.requestAnimationFrame.lastCall.args[0];

    element.classList.add.reset();
    addModifier();

    expect(element.classList.add).to.be.calledOnce;
    expect(element.classList.add).calledWith(animationClass + activeModifier);

    transitionEnd.apply(element);

    expect(element.removeEventListener).to.have.been.calledTwice;
    expect(element.removeEventListener).calledWith('transitionend', transitionEnd);
    expect(element.removeEventListener).calledWith('animationend', transitionEnd);

    expect(element.classList.remove).to.be.calledTwice;
    expect(element.classList.remove).calledWith(animationClass);
    expect(element.classList.remove).calledWith(animationClass + activeModifier);
  });

  it('it applies active modifier to exitAnimation class on exit()', () => {
    let element = createFakeElement();
    let props = {};
    let animationClass = 'exit';
    let removeElement = sinon.stub();

    cssTransitions.exit(element as any, props, animationClass, removeElement);

    expect(element.classList.add).to.be.calledOnce;
    expect(element.classList.add.lastCall.args[0]).to.equal(animationClass);

    let transitionEnd = element.addEventListener.getCall(0).args[1];

    expect(transitionEnd).to.be.a('function');

    expect(element.addEventListener).to.have.been.calledTwice;
    expect(element.addEventListener).calledWith('transitionend', transitionEnd);
    expect(element.addEventListener).calledWith('animationend', transitionEnd);

    let addModifier = global.requestAnimationFrame.lastCall.args[0];

    element.classList.add.reset();
    addModifier();

    expect(element.classList.add).to.be.calledOnce;
    expect(element.classList.add).calledWith(animationClass + activeModifier);

    expect(removeElement).to.not.have.been.called;

    transitionEnd.apply(element);

    expect(element.removeEventListener).to.have.been.calledTwice;
    expect(element.removeEventListener).calledWith('transitionend', transitionEnd);
    expect(element.removeEventListener).calledWith('animationend', transitionEnd);

    expect(removeElement).to.have.been.called;
  });

});
