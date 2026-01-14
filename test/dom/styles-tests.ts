import { dom, h } from "../../src/index";
import { expect, describe, it } from "../test-utilities";

describe("dom", () => {
  describe("styles", () => {
    it("should not allow non-string values", () => {
      try {
        dom.create(h("div", { styles: { height: 20 } as any }));
        expect.fail("Expected an error to be thrown");
      } catch (e) {
        expect((e as Error).message.indexOf("strings") >= 0).toBe(true);
      }
    });

    it("should add styles to the real DOM", () => {
      let projection = dom.create(h("div", { styles: { height: "20px" } }));
      expect(projection.domNode.outerHTML).toBe('<div style="height: 20px;"></div>');
    });

    it("should update styles", () => {
      let projection = dom.create(h("div", { styles: { height: "20px" } }));
      projection.update(h("div", { styles: { height: "30px" } }));
      expect(projection.domNode.outerHTML).toBe('<div style="height: 30px;"></div>');
    });

    it("should remove styles", () => {
      let projection = dom.create(h("div", { styles: { height: "20px" } }));
      projection.update(h("div", { styles: { height: null } }));
      expect(projection.domNode.outerHTML).toBe('<div style=""></div>');
    });

    it("should add and keep styles", () => {
      let projection = dom.create(h("div", { styles: { height: undefined } }));
      projection.update(h("div", { styles: { height: "20px" } }));
      expect(projection.domNode.outerHTML).toBe('<div style="height: 20px;"></div>');
      projection.update(h("div", { styles: { height: "20px" } }));
      expect(projection.domNode.outerHTML).toBe('<div style="height: 20px;"></div>');
    });

    it("can set CSS variables", () => {
      let projection = dom.create(h("div", { styles: { "--primary-color": "red" } }));
      expect(projection.domNode.outerHTML).toBe('<div style="--primary-color: red;"></div>');
    });

    it("should use the provided styleApplyer", () => {
      let styleApplyer = (domNode: Element, styleName: string, value: string) => {
        // Useless styleApplyer which transforms height to minHeight
        (domNode as any).style[`min${styleName.substr(0, 1).toUpperCase()}${styleName.substr(1)}`] =
          value;
      };
      let projection = dom.create(h("div", { styles: { height: "20px" } }), {
        styleApplyer: styleApplyer,
      });
      expect(projection.domNode.outerHTML).toBe('<div style="min-height: 20px;"></div>');
      projection.update(h("div", { styles: { height: "30px" } }));
      expect(projection.domNode.outerHTML).toBe('<div style="min-height: 30px;"></div>');
    });
  });
});
