var maquette = require("../src/maquette.js");
var assert = require("assert");
var jsdom = require('mocha-jsdom');
var expect = require('chai').expect;

var h = maquette.h;

describe('Maquette', function () {
  describe('styles', function () {

    jsdom();

    it("should not allow non-string values", function () {
      try {
        maquette.createDom(h("div", { styles: { height: 20 } }));
        assert.fail();
      } catch(e) {
        expect(e.message.indexOf("strings") >= 0).to.be.true;
      }
    });

    it("should add styles to the real DOM", function () {
      var projection = maquette.createDom(h("div", { styles: { height: "20px" } }));
      expect(projection.domNode.outerHTML).to.equal("<div style=\"height: 20px;\"></div>");
    });

    it("should update styles", function () {
      var projection = maquette.createDom(h("div", { styles: { height: "20px" } }));
      projection.update(h("div", { styles: { height: "30px" } }));
      expect(projection.domNode.outerHTML).to.equal("<div style=\"height: 30px;\"></div>");
    });

    it("should remove styles", function () {
      var projection = maquette.createDom(h("div", { styles: { height: "20px" } }));
      projection.update(h("div", { styles: { height: null } }));
      expect(projection.domNode.outerHTML).to.equal("<div style=\"\"></div>");
    });

  });
});
