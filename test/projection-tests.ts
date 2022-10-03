import { VNode } from "../src";
import { createDom } from "../src/projection";
import { expect, sinon } from "./test-utilities";

describe("Projection", () => {
  describe("createDom", () => {
    let vnode: VNode;
    let parentNode: Node;

    beforeEach(() => {
      vnode = {
        vnodeSelector: "",
        properties: undefined,
        children: undefined,
        domNode: undefined,
        text: undefined,
      };

      parentNode = <any>{
        ownerDocument: <any>{
          createTextNode: sinon.stub().returns({}),
        },
        insertBefore: sinon.stub(),
        appendChild: sinon.stub(),
      };
    });

    it("when creating a text node and the vnode already has a (cached) domNode re-use and update the domNode", () => {
      let domNode = <any>{
        nodeValue: "Bar",
      };
      Object.assign(vnode, { text: "Foo", domNode });

      createDom(vnode, parentNode, undefined, {});

      expect(parentNode.ownerDocument.createTextNode).to.not.have.been.called;
      expect(domNode.nodeValue).to.equal("Foo");
    });
  });
});
