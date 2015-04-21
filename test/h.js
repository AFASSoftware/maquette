var maquette = require("../src/maquette.js");
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
    
    it('should notice a common pitfall with a missing comma', function() {
      try {
        h("div", {classes:{}} ["text"])
        assert.fail("there was no error");
      } catch(e) {
        assert.ok(e.message.indexOf("forgot the comma") !== -1, "errormessage was right");
      }
    });
  });
});
