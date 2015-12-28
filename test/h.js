/* globals describe,it */
var maquette = require("../dist/maquette.js");
var assert = require("assert");

describe('Maquette', function () {
  describe('#h()', function () {

    var h = maquette.h;
    
    var toTextVNode = function (text) {
      return {
        vnodeSelector: "",
        properties: undefined,
        children: undefined,
        text: text,
        domNode: null
      };
    };

    it('should flatten nested arrays', function () {

      var vnode = h("div", [
        "text",
        null,
        [ /* empty nested array */],
        [null],
        ["nested text"],
        [h("span")],
        [h("button", ["click me"])],
        [[[["deep"], null], "here"]]
      ]);
      
      assert.deepEqual(vnode.children, [
        toTextVNode("text"),
        toTextVNode("nested text"),
        h("span"),
        h("button", ["click me"]),
        toTextVNode("deep"),
        toTextVNode("here")
      ]);
      
    });
    
    it("Should be very flexible when accepting arguments", function() {
      
      var vnode = h("div", 
        "text", 
        h("span", [
          [
            "in array"
          ]
        ]),
        h("img", {src: "x.png"}),
        "text2",
        undefined,
        null,
        [
          undefined,
          h("button", "click me"),
          h("button", undefined, "click me")
        ]
      );
      
      assert.deepEqual(vnode.children, [
        toTextVNode("text"),
        h("span", "in array", undefined),
        h("img", {src:"x.png"}),
        toTextVNode("text2"),
        h("button", "click me"),
        h("button", "click me", undefined)
      ]);
      
    });
    
    it("Should render a number as text", function(){
      assert.deepEqual(h("div", 1), {vnodeSelector:"div", properties:undefined, text: undefined, children:[toTextVNode("1")], domNode: null});
    });
  });
});
