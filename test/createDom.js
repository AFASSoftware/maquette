var maquette = require("../src/maquette.js");
var assert = require("assert");
var jsdom = require('mocha-jsdom');
var expect = require('chai').expect;

var h = maquette.h;

describe('Maquette', function () {
  describe('#createDom()', function () {

    jsdom();

    it("should create and update single textnodes", function () {
      var projection = maquette.createDom(h("div", ["text"]));
      expect(projection.domNode.outerHTML).to.equal("<div>text</div>");

      projection.update(h("div", ["text2"]));
      expect(projection.domNode.outerHTML).to.equal("<div>text2</div>");

      projection.update(h("div", ["text2", h("span", ["a"])]));
      expect(projection.domNode.outerHTML).to.equal("<div>text2<span>a</span></div>");

      projection.update(h("div", ["text2"]));
      expect(projection.domNode.outerHTML).to.equal("<div>text2</div>");

      projection.update(h("div", ["text"]));
      expect(projection.domNode.outerHTML).to.equal("<div>text</div>");
    });

    it("should work correctly with adjacent textnodes", function () {
      var projection = maquette.createDom(h("div", ["", "1", ""]));
      expect(projection.domNode.outerHTML).to.equal("<div>1</div>");

      projection.update(h("div", ["",""]));
      expect(projection.domNode.outerHTML).to.equal("<div></div>");

      projection.update(h("div", ["", "1", ""]));
      expect(projection.domNode.outerHTML).to.equal("<div>1</div>");
    });


  });
});
