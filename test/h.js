var maquette = require("../src/maquette.js");
var assert = require("assert");

describe('Maquette', function () {
  describe('#h()', function () {

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
      var h = maquette.h;

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
  });
});
