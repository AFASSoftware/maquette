import {expect, jsdom} from '../utilities';
import {h, dom} from '../../src/maquette';

describe('dom', function() {

  describe('children', function() {

    jsdom();

    it('can remove childnodes', () => {
      let projection = dom.create(h('div', [
        h('span', { key: 1 }),
        h('span', { key: 2 }),
        h('span', { key: 3 })
      ]));

      let div = projection.domNode as HTMLDivElement;
      expect(div.children.length).to.equal(3);
      let firstSpan = div.children[0];
      let lastSpan = div.children[2];

      // Remove middle div
      projection.update(h('div', [
        h('span', { key: 1 }),
        h('span', { key: 3 })
      ]));

      expect(div.children.length).to.equal(2);
      expect(div.children[0]).to.equal(firstSpan);
      expect(div.children[1]).to.equal(lastSpan);

      // Remove first div
      projection.update(h('div', [
        h('span', { key: 3 })
      ]));

      expect(div.children.length).to.equal(1);
      expect(div.children[0]).to.equal(lastSpan);

      // Remove last div
      projection.update(h('div', [
      ]));

      expect(div.children.length).to.equal(0);
    });

    it('can add childnodes', () => {
      let projection = dom.create(h('div', [
        h('span', { key: 2 }),
        h('span', { key: 4 })
      ]));

      let div = projection.domNode as HTMLDivElement;
      expect(div.children.length).to.equal(2);
      let firstSpan = div.children[0];
      let lastSpan = div.children[1];

      projection.update(h('div', [
        h('span', { key: 1 }),
        h('span', { key: 2 }),
        h('span', { key: 3 }),
        h('span', { key: 4 }),
        h('span', { key: 5 })
      ]));

      expect(div.children.length).to.equal(5);
      expect(div.children[1]).to.equal(firstSpan);
      expect(div.children[3]).to.equal(lastSpan);
    });

    it('will throw an error when maquette is not sure which node is added', () => {
      let projection = dom.create(h('div', [
        h('span', 'a'),
        h('span', 'c')
      ]));
      expect(() => {
        projection.update(h('div', [
          h('span', 'a'),
          h('span', 'b'),
          h('span', 'c')
        ]));
      }).to.throw();
    });

    it('will throw an error when maquette is not sure which node is removed', () => {
      let projection = dom.create(h('div', [
        h('span', 'a'),
        h('span', 'b'),
        h('span', 'c')
      ]));
      expect(() => {
        projection.update(h('div', [
          h('span', 'a'),
          h('span', 'c')
        ]));
      }).to.throw();
    });

  });


});
