import {expect, jsdom, sinon} from '../utilities';
import {h, dom} from '../../src/maquette';

describe('dom', function() {

  describe('animations', function() {

    describe('updateAnimation', function() {

      jsdom();

      it('is invoked when a node contains only text and that text changes', function() {
        let updateAnimation = sinon.stub();
        let projection = dom.create(h('div', { updateAnimation: updateAnimation }, ['text']));
        projection.update(h('div', { updateAnimation: updateAnimation }, ['text2']));
        expect(updateAnimation).to.have.been.calledOnce;
        expect(projection.domNode.outerHTML).to.equal('<div>text2</div>');
      });

    });
  });

});
