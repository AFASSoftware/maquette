/* globals describe,it */
var maquette = require("../dist/maquette.js");
var assert = require("assert");
var jsdom = require('mocha-jsdom');
var chai = require('chai');
chai.use(require('sinon-chai'));
var expect = chai.expect;
var sinon = require('sinon');

var h = maquette.h;

describe('Maquette', function () {
  describe('animations', function () {
    
    describe('updateAnimation', function () {
    
      jsdom();
      
      it('is invoked when a node contains only text and that text changes', function() {
        var updateAnimation = sinon.stub();
        var projection = maquette.dom.create(h("div", {updateAnimation: updateAnimation}, ["text"]));
        projection.update(h("div", {updateAnimation: updateAnimation}, ["text2"]));
        expect(updateAnimation).to.have.been.calledOnce;
        expect(projection.domNode.outerHTML).to.equal("<div>text2</div>");
      });
      
    });
  });
});
  
