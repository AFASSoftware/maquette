import {expect, jsdom} from '../utilities';
import {h, dom} from '../../src/maquette';

describe('dom', function() {

  describe('styles', function() {

    jsdom();

    it('should not allow non-string values', function() {
      try {
        dom.create(h('div', { styles: { height: 20 } as any }));
        expect.fail();
      } catch (e) {
        expect(e.message.indexOf('strings') >= 0).to.be.true;
      }
    });

    it('should add styles to the real DOM', function() {
      let projection = dom.create(h('div', { styles: { height: '20px' } }));
      expect(projection.domNode.outerHTML).to.equal('<div style="height: 20px;"></div>');
    });

    it('should update styles', function() {
      let projection = dom.create(h('div', { styles: { height: '20px' } }));
      projection.update(h('div', { styles: { height: '30px' } }));
      expect(projection.domNode.outerHTML).to.equal('<div style="height: 30px;"></div>');
    });

    it('should remove styles', function() {
      let projection = dom.create(h('div', { styles: { height: '20px' } }));
      projection.update(h('div', { styles: { height: null } }));
      expect(projection.domNode.outerHTML).to.equal('<div style=""></div>');
    });

    it('should add styles', function() {
      let projection = dom.create(h('div', { styles: { height: undefined } }));
      projection.update(h('div', { styles: { height: '20px' } }));
      expect(projection.domNode.outerHTML).to.equal('<div style="height: 20px;"></div>');
      projection.update(h('div', { styles: { height: '20px' } }));
    });

    it('should use the provided styleApplyer', function() {
      let styleApplyer = (domNode: Element, styleName: string, value: string) => {
        // Useless styleApplyer which transforms height to minHeight
        (domNode as any).style['min' + styleName.substr(0, 1).toUpperCase() + styleName.substr(1)] = value;
      };
      let projection = dom.create(h('div', { styles: { height: '20px' } }), { styleApplyer: styleApplyer });
      expect(projection.domNode.outerHTML).to.equal('<div style="min-height: 20px;"></div>');
      projection.update(h('div', { styles: { height: '30px' } }));
      expect(projection.domNode.outerHTML).to.equal('<div style="min-height: 30px;"></div>');
    });

  });

});
