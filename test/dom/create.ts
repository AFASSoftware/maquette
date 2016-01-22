import {expect, jsdom} from '../utilities';
import {h, dom} from '../../src/maquette';

describe('dom', function() {
  describe('create', function() {

    jsdom();

    it('should create and update single textnodes', function() {
      let projection = dom.create(h('div', ['text']));
      expect(projection.domNode.outerHTML).to.equal('<div>text</div>');

      projection.update(h('div', ['text2']));
      expect(projection.domNode.outerHTML).to.equal('<div>text2</div>');

      projection.update(h('div', ['text2', h('span', ['a'])]));
      expect(projection.domNode.outerHTML).to.equal('<div>text2<span>a</span></div>');

      projection.update(h('div', ['text2']));
      expect(projection.domNode.outerHTML).to.equal('<div>text2</div>');

      projection.update(h('div', ['text']));
      expect(projection.domNode.outerHTML).to.equal('<div>text</div>');
    });

    it('should work correctly with adjacent textnodes', function() {
      let projection = dom.create(h('div', ['', '1', '']));
      expect(projection.domNode.outerHTML).to.equal('<div>1</div>');

      projection.update(h('div', ['', '']));
      expect(projection.domNode.outerHTML).to.equal('<div></div>');

      projection.update(h('div', ['', '1', '']));
      expect(projection.domNode.outerHTML).to.equal('<div>1</div>');
    });

    it('should parse the selector', function() {

      let projection = dom.create(h('div'));
      expect(projection.domNode.outerHTML).to.equal('<div></div>');

      projection = dom.create(h('div.class1'));
      expect(projection.domNode.outerHTML).to.equal('<div class="class1"></div>');

      projection = dom.create(h('div#id'));
      expect(projection.domNode.outerHTML).to.equal('<div id="id"></div>');

      projection = dom.create(h('div.class1.class2'));
      expect(projection.domNode.outerHTML).to.equal('<div class="class1 class2"></div>');

      projection = dom.create(h('div.class1.class2#id'));
      expect(projection.domNode.outerHTML).to.equal('<div class="class1 class2" id="id"></div>');

      projection = dom.create(h('div#id.class1.class2'));
      expect(projection.domNode.outerHTML).to.equal('<div id="id" class="class1 class2"></div>');
    });

    it('should give a meaningful error when the root selector is changed', () => {
      let projection = dom.create(h('div'));
      expect(() => {
        projection.update(h('span'));
      }).to.throw(/may not be changed/);
    });

  });
});
