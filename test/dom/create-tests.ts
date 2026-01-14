import { dom, h } from "../../src/index";
import { expect, describe, it, vi } from "../test-utilities";

describe("dom", () => {
  describe("create", () => {
    it("should create and update single textnodes", () => {
      let projection = dom.create(h("div", ["text"]));
      expect(projection.domNode.outerHTML).toBe("<div>text</div>");

      projection.update(h("div", ["text2"]));
      expect(projection.domNode.outerHTML).toBe("<div>text2</div>");

      projection.update(h("div", ["text2", h("span", ["a"])]));
      expect(projection.domNode.outerHTML).toBe("<div>text2<span>a</span></div>");

      projection.update(h("div", ["text2"]));
      expect(projection.domNode.outerHTML).toBe("<div>text2</div>");

      projection.update(h("div", ["text"]));
      expect(projection.domNode.outerHTML).toBe("<div>text</div>");
    });

    it("should work correctly with adjacent textnodes", () => {
      let projection = dom.create(h("div", ["", "1", ""]));
      expect(projection.domNode.outerHTML).toBe("<div>1</div>");

      projection.update(h("div", ["", ""]));
      expect(projection.domNode.outerHTML).toBe("<div></div>");

      projection.update(h("div", ["", "1", ""]));
      expect(projection.domNode.outerHTML).toBe("<div>1</div>");
    });

    it("should parse the selector", () => {
      let projection = dom.create(h("div"));
      expect(projection.domNode.outerHTML).toBe("<div></div>");

      projection = dom.create(h("div.class1"));
      expect(projection.domNode.outerHTML).toBe('<div class="class1"></div>');

      projection = dom.create(h("div#id"));
      expect(projection.domNode.outerHTML).toBe('<div id="id"></div>');

      projection = dom.create(h("div.class1.class2"));
      expect(projection.domNode.outerHTML).toBe('<div class="class1 class2"></div>');

      projection = dom.create(h("div.class1.class2#id"));
      expect(projection.domNode.outerHTML).toBe('<div class="class1 class2" id="id"></div>');

      projection = dom.create(h("div#id.class1.class2"));
      expect(projection.domNode.outerHTML).toBe('<div id="id" class="class1 class2"></div>');
    });

    it("should give a meaningful error when the root selector is changed", () => {
      let projection = dom.create(h("div"));
      expect(() => {
        projection.update(h("span"));
      }).toThrow(/may not be changed/);
    });

    it("should allow an existing dom node to be used", () => {
      const node = document.createElement("div");
      (node as any).foo = "foo";
      const childNode = document.createElement("span");
      (childNode as any).bar = "bar";
      node.appendChild(childNode);
      const spy = vi.spyOn(node, "appendChild");

      const childVNode = h("span", { id: "b" });
      childVNode.domNode = childNode;
      const vnode = h("div", { id: "a" }, [childVNode]);
      vnode.domNode = node;

      const projection = dom.create(vnode);
      const root = projection.domNode as any;
      expect(root.outerHTML).toBe('<div id="a"><span id="b"></span></div>');
      expect(root.foo).toBe("foo");
      expect(root.children[0].bar).toBe("bar");
      // should not append child again, if it has a parent that matches
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
