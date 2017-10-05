import { expect, sinon } from '../test-utilities';
import { dom, h } from '../../src/index';

describe('dom', () => {
  describe('animations', () => {
    describe('updateAnimation', () => {
      it('is invoked when a node contains only text and that text changes', () => {
        let updateAnimation = sinon.stub();
        let projection = dom.create(h('div', { updateAnimation }, ['text']));
        projection.update(h('div', { updateAnimation }, ['text2']));
        expect(updateAnimation).to.have.been.calledOnce;
        expect(projection.domNode.outerHTML).to.equal('<div>text2</div>');
      });

      it('is invoked when a node contains text and other nodes and the text changes', () => {
        let updateAnimation = sinon.stub();
        let projection = dom.create(h('div', { updateAnimation }, ['textBefore', h('span'), 'textAfter']));
        projection.update(h('div', { updateAnimation }, ['textBefore', h('span'), 'newTextAfter']));
        expect(updateAnimation).to.have.been.calledOnce;
        updateAnimation.reset();

        projection.update(h('div', { updateAnimation }, ['textBefore', h('span'), 'newTextAfter']));
        expect(updateAnimation).to.not.have.been.called;
      });

      it('is invoked when a property changes', () => {
        let updateAnimation = sinon.stub();
        let projection = dom.create(h('a', { updateAnimation, href: '#1' }));
        projection.update(h('a', { updateAnimation, href: '#2' }));
        expect(updateAnimation).to.have.been.calledWith(projection.domNode, sinon.match({ href: '#2' }), sinon.match({ href: '#1' }));
      });

    });

    describe('enterAnimation', () => {
      it('is invoked when a new node is added to an existing parent node', () => {
        let enterAnimation = sinon.stub();
        let projection = dom.create(h('div', [
        ]));

        projection.update(h('div', [
          h('span', { enterAnimation })
        ]));

        expect(enterAnimation).to.have.been.calledWith(projection.domNode.childNodes[0], sinon.match({}));
      });

    });

    describe('exitAnimation', () => {
      it('is invoked when a node is removed from an existing parent node', () => {
        let exitAnimation = sinon.stub();
        let projection = dom.create(h('div', [
          h('span', { exitAnimation })
        ]));

        projection.update(h('div', [
        ]));

        expect(exitAnimation).to.have.been.calledWithExactly(projection.domNode.childNodes[0], sinon.match({}), sinon.match({}));

        expect(projection.domNode.childNodes).to.have.length(1);
        exitAnimation.lastCall.callArg(1); // arg1: removeElement
        expect(projection.domNode.childNodes).to.be.empty;
        exitAnimation.lastCall.callArg(1); // arg1: removeElement
      });

    });

  });

});
