/* globals describe,it */
var maquette = require("../dist/maquette.js");
var assert = require("assert");
var jsdom = require('mocha-jsdom');
var expect = require('chai').expect;

var h = maquette.h;

describe('Maquette', function () {
  describe('#createDom()', function () {

    jsdom();

    it("should create and update single textnodes", function () {
      var projection = maquette.dom.create(h("div", ["text"]));
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
      var projection = maquette.dom.create(h("div", ["", "1", ""]));
      expect(projection.domNode.outerHTML).to.equal("<div>1</div>");

      projection.update(h("div", ["",""]));
      expect(projection.domNode.outerHTML).to.equal("<div></div>");

      projection.update(h("div", ["", "1", ""]));
      expect(projection.domNode.outerHTML).to.equal("<div>1</div>");
    });

    it("should parse the selector", function () {

      require("./jsdom-classlist-polyfill")(window);
    
      var projection = maquette.dom.create(h("div"));
      expect(projection.domNode.outerHTML).to.equal("<div></div>");

      projection = maquette.dom.create(h("div.class1"));
      expect(projection.domNode.outerHTML).to.equal("<div class=\"class1\"></div>");

      projection = maquette.dom.create(h("div#id"));
      expect(projection.domNode.outerHTML).to.equal("<div id=\"id\"></div>");

      projection = maquette.dom.create(h("div.class1.class2"));
      expect(projection.domNode.outerHTML).to.equal("<div class=\"class1 class2\"></div>");

      projection = maquette.dom.create(h("div.class1.class2#id"));
      expect(projection.domNode.outerHTML).to.equal("<div class=\"class1 class2\" id=\"id\"></div>");

      projection = maquette.dom.create(h("div#id.class1.class2"));
      expect(projection.domNode.outerHTML).to.equal("<div id=\"id\" class=\"class1 class2\"></div>");
    });

  });
});
