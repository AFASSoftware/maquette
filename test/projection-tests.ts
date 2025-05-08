import { SinonStub } from "sinon";

import { VNode, dom, h } from "../src";
import { createDom, createProjection } from "../src/projection";
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

  describe("projection.update", () => {
    it("handles DOM updates correctly when external scripts (like Google Translate) modify the DOM structure", () => {
      const projectionOptions = {};

      // Old VDOM ("Amerikaa[n]se Maagde[n] eilande[n]")
      const oldVNode = h("span", { class: "ReferenceMenuItem-label" }, [
        "Amerikaa",
        h("mark", { class: "Highlight", key: "1" }, ["n"]),
        "se Maagde",
        h("mark", { class: "Highlight", key: "2" }, ["n"]),
        " eilande",
        h("mark", { class: "Highlight", key: "3" }, ["n"]),
      ]);

      dom.create(oldVNode, projectionOptions);
      let projection = createProjection(oldVNode, projectionOptions);

      let spanElement = projection.domNode as HTMLElement;
      expect(spanElement.childNodes.length).to.equal(6);

      spanElement.replaceChild(wrapInFont("America"), spanElement.childNodes[0]);
      spanElement.replaceChild(wrapInFont("the Virgin"), spanElement.childNodes[2]);
      spanElement.replaceChild(wrapInFont("island"), spanElement.childNodes[4]);

      // New VDOM ("Amerikaanse Maagde[ne]ilande")
      const newVNode = h("span", { class: "ReferenceMenuItem-label" }, [
        "Amerikaanse Maagde",
        h("mark", { class: "Highlight", key: "1" }, ["ne"]),
        "ilanden",
      ]);

      projection.update(newVNode);
      expect(spanElement.childNodes.length).to.equal(4); // the last translated child is unfortunately not removed

      expect(spanElement.childNodes[0].nodeValue).to.equal("Amerikaanse Maagde");
      expect(spanElement.childNodes[1].childNodes[0].nodeValue).to.equal("ne");
      expect(spanElement.childNodes[2].nodeValue).to.equal("ilanden");

      function wrapInFont(text: string) {
        return dom.create(
          h("font", { style: { verticalAlign: "inherit" } }, [
            h("font", { style: { verticalAlign: "inherit" } }, [text]),
          ])
        ).domNode;
      }
    });
  });
});
