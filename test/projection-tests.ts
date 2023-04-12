import { SinonStub } from "sinon";

import { VNode, h } from "../src";
import { createDom } from "../src/projection";
import { expect, sinon } from "./test-utilities";

describe("Projection", () => {
  describe("createDom", () => {
    let vnode: VNode;
    let parentNode: Node;
    let createElement: SinonStub;
    let createTextNode: SinonStub;

    beforeEach(() => {
      vnode = {
        vnodeSelector: "",
        properties: undefined,
        children: undefined,
        domNode: undefined,
        text: undefined,
      };

      createTextNode = sinon.stub().returns({});
      createElement = sinon.stub().returns({
        setAttribute() {
          /* noop */
        },
      });

      parentNode = <any>{
        ownerDocument: <any>{
          createTextNode,
          createElement,
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

      expect(createTextNode).to.not.have.been.called;
      expect(domNode.nodeValue).to.equal("Foo");
    });

    it("uses the vnode.properties.is when constructing an element", () => {
      vnode = h("p", { is: "my-custom-element", id: "id1" });
      createDom(vnode, parentNode, undefined, {});
      expect(createElement.lastCall.args).to.deep.equal(["p", { is: "my-custom-element" }]);
    });
  });
});
