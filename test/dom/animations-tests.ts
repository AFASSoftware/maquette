import { dom, h } from "../../src/index";
import { describe, expect, it, vi } from "../test-utilities";

describe("dom", () => {
  describe("animations", () => {
    describe("updateAnimation", () => {
      it("is invoked when a node contains only text and that text changes", () => {
        let updateAnimation = vi.fn();
        let projection = dom.create(h("div", { updateAnimation }, ["text"]));
        projection.update(h("div", { updateAnimation }, ["text2"]));
        expect(updateAnimation).toHaveBeenCalledTimes(1);
        expect(projection.domNode.outerHTML).toBe("<div>text2</div>");
      });

      it("is invoked when a node contains text and other nodes and the text changes", () => {
        let updateAnimation = vi.fn();
        let projection = dom.create(
          h("div", { updateAnimation }, ["textBefore", h("span"), "textAfter"])
        );
        projection.update(h("div", { updateAnimation }, ["textBefore", h("span"), "newTextAfter"]));
        expect(updateAnimation).toHaveBeenCalledTimes(1);
        updateAnimation.mockClear();

        projection.update(h("div", { updateAnimation }, ["textBefore", h("span"), "newTextAfter"]));
        expect(updateAnimation).not.toHaveBeenCalled();
      });

      it("is invoked when a property changes", () => {
        let updateAnimation = vi.fn();
        let projection = dom.create(h("a", { updateAnimation, href: "#1" }));
        projection.update(h("a", { updateAnimation, href: "#2" }));
        expect(updateAnimation).toHaveBeenCalledWith(
          projection.domNode,
          expect.objectContaining({ href: "#2" }),
          expect.objectContaining({ href: "#1" })
        );
      });
    });

    describe("enterAnimation", () => {
      it("is invoked when a new node is added to an existing parent node", () => {
        let enterAnimation = vi.fn();
        let projection = dom.create(h("div", []));

        projection.update(h("div", [h("span", { enterAnimation })]));

        expect(enterAnimation).toHaveBeenCalledWith(
          projection.domNode.childNodes[0],
          expect.anything()
        );
      });
    });

    describe("exitAnimation", () => {
      it("is invoked when a node is removed from an existing parent node", () => {
        let exitAnimation = vi.fn();
        let projection = dom.create(h("div", [h("span", { exitAnimation })]));

        projection.update(h("div", []));

        expect(exitAnimation).toHaveBeenCalledWith(
          projection.domNode.childNodes[0],
          expect.anything(),
          expect.anything()
        );

        expect(projection.domNode.childNodes).toHaveLength(1);
        exitAnimation.mock.calls[exitAnimation.mock.calls.length - 1][1](); // arg1: removeElement
        expect(projection.domNode.childNodes).toHaveLength(0);
        exitAnimation.mock.calls[exitAnimation.mock.calls.length - 1][1](); // arg1: removeElement
      });
    });
  });
});
