import {expect, jsdom, sinon} from '../utilities';
import {h, dom} from '../../src/maquette';

describe('dom', () => {

  jsdom();

  describe('beforeRemove', () => {

    it('is invoked before a node is removed from the dom', () => {
      let beforeRemove = sinon.stub();
      let projection = dom.create(h('div', {}, [
        h('span', { beforeRemove })
      ]));
      projection.update(h('div', {}, []));
      expect(beforeRemove).to.have.been.calledOnce;
    });

    it('is invoked with "this" set to the value of the bind property', () => {
      let beforeRemove = sinon.stub();
      let thisObject = sinon.stub();
      let projection = dom.create(h('div', {}, [
        h('span', { beforeRemove, bind: thisObject })
      ]));
      projection.update(h('div', {}, []));
      expect(beforeRemove).to.be.calledOn(thisObject);
    });

  });

});
