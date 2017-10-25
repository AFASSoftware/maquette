import { expect, sinon } from '../test-utilities';
import { dom, h } from '../../src';

describe('dom', () => {
  describe('afterRemoved', () => {
    it('will be invoked when a node has been removed from the tree', () => {
      let afterRemoved = sinon.spy();
      let nodeToBeRemoved = h('div', { afterRemoved });
      let projection = dom.create(h('div', [nodeToBeRemoved]));
      projection.update(h('div', []));

      expect(afterRemoved).to.have.been.called;
    });

    it('will be invoked with "this" set to the value of the bind property', () => {
      let afterRemoved = sinon.spy();
      let thisObject = sinon.spy();
      let nodeToBeRemoved = h('div', { afterRemoved, bind: thisObject });
      let projection = dom.create(h('div', [nodeToBeRemoved]));
      projection.update(h('div', []));

      expect(afterRemoved).to.have.been.calledOn(thisObject);
    });

    it('will be invoked when the exit animation is done', () => {
      let afterRemoved = sinon.spy();
      let nodeToBeRemoved = h('div', { afterRemoved, exitAnimation: (element, removeElement) => removeElement() });
      let projection = dom.create(h('div', [nodeToBeRemoved]));
      projection.update(h('div', []));

      expect(afterRemoved).to.have.been.called;
    });
  });
});
