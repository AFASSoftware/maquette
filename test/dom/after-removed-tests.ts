import { expect, sinon } from '../test-utilities';
import { dom, h } from '../../src';
import { SinonFakeTimers, SinonStub } from 'sinon';

describe('dom', () => {
  describe('afterRemoved', () => {
    let requestIdleCallback: SinonStub;
    let clock: SinonFakeTimers;

    beforeEach(() => {
      requestIdleCallback = sinon.stub();
      global.window = <any>{ requestIdleCallback };
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      delete global.window;
      clock.restore();
    });

    it('will request a single idle callback when multiple nodes are removed', () => {
      let afterRemoved1 = sinon.spy();
      let afterRemoved2 = sinon.spy();
      let projection = dom.create(h('div', [
        h('div.1', { afterRemoved: afterRemoved1 }),
        h('div.2', { afterRemoved: afterRemoved2 })
      ]));
      projection.update(h('div', []));

      expect(requestIdleCallback).to.have.been.calledOnce;

      requestIdleCallback.yield();

      expect(afterRemoved1).to.have.been.called;
      expect(afterRemoved2).to.have.been.called;
    });

    it('will use setTimeout when requestIdleCallback is not available', () => {
      delete (global as any).window;

      let afterRemoved = sinon.spy();
      let projection = dom.create(h('div', [
        h('div', { afterRemoved })
      ]));

      projection.update(h('div', []));

      expect(afterRemoved).to.not.have.been.called;
      clock.tick(16);
      expect(afterRemoved).to.have.been.called;
    });

    it('will be invoked with the removed dom node when a node has been removed from the tree', () => {
      requestIdleCallback.yields();

      let afterRemoved = sinon.spy();
      let projection = dom.create(h('div', [
        h('div', { afterRemoved })
      ]));

      let domNode = projection.domNode.children[0];
      projection.update(h('div', []));

      expect(afterRemoved).to.have.been.calledWith(domNode);
    });

    it('will be invoked with "this" set to the value of the bind property', () => {
      requestIdleCallback.yields();

      let afterRemoved = sinon.spy();
      let thisObject = sinon.spy();
      let projection = dom.create(h('div', [
        h('div', { afterRemoved, bind: thisObject })
      ]));
      projection.update(h('div', []));

      expect(afterRemoved).to.have.been.calledOn(thisObject);
    });

    it('will be invoked when the exit animation is done', () => {
      requestIdleCallback.yields();

      let afterRemoved = sinon.spy();
      let projection = dom.create(h('div', [
        h('div', {
          afterRemoved,
          exitAnimation: (element, removeElement) => removeElement()
        })
      ]));
      projection.update(h('div', []));

      expect(afterRemoved).to.have.been.called;
    });
  });
});
