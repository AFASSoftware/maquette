import {expect, jsdom, sinon} from '../utilities';
import {h, dom} from '../../src/maquette';

describe('dom', () => {

  jsdom();

  describe('afterCreate', () => {

    it('is always invoked when a new node is rendered', () => {
      let afterCreate = sinon.stub();
      let projection = dom.create(h('div', { afterCreate }));
      expect(afterCreate).to.have.been.calledWith(projection.domNode);
    });

    it('invokes afterCreate with "this" set to the value of the bind property', () => {
      let afterCreate = sinon.stub();
      let thisObject = sinon.stub();
      let projection = dom.create(h('div', { afterCreate: afterCreate, bind: thisObject }));
      expect(afterCreate).to.be.calledOn(thisObject);
    });

  });

  describe('afterUpdate', () => {

    it('is always invoked when the dom is being rendered, regardless of updates to the node itself', () => {
      let afterUpdate = sinon.stub();
      let projection = dom.create(h('div', { afterUpdate }));
      projection.update(h('div', { afterUpdate }));
      expect(afterUpdate).to.have.been.calledWith(projection.domNode);
    });

    it('invokes afterUpdate with "this" set to the value of the bind property', () => {
      let afterUpdate = sinon.stub();
      let thisObject = sinon.stub();
      let projection = dom.create(h('div', { afterUpdate: afterUpdate, bind: thisObject }));
      projection.update(h('div', { afterUpdate: afterUpdate, bind: thisObject }));
      expect(afterUpdate).to.be.calledOn(thisObject);
    });

  });

});
