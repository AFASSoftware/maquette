import { dom, h } from "../../src/index";
import { describe, expect, it, vi } from "../test-utilities";

describe("dom", () => {
  describe("afterCreate", () => {
    it("is always invoked when a new node is rendered", () => {
      let afterCreate = vi.fn();
      let projection = dom.create(h("div", { afterCreate }));
      expect(afterCreate).toHaveBeenCalled();
      expect(afterCreate.mock.calls[0][0]).toBe(projection.domNode);
    });

    it('invokes afterCreate with "this" set to the value of the bind property', () => {
      let afterCreate = vi.fn();
      let thisObject = vi.fn();
      dom.create(h("div", { afterCreate: afterCreate, bind: thisObject }));
      expect(afterCreate.mock.instances[0]).toBe(thisObject);
    });
  });

  describe("afterUpdate", () => {
    it("is always invoked when the dom is being rendered, regardless of updates to the node itself", () => {
      let afterUpdate = vi.fn();
      let projection = dom.create(h("div", { afterUpdate }));
      projection.update(h("div", { afterUpdate }));
      expect(afterUpdate).toHaveBeenCalled();
      expect(afterUpdate.mock.calls[0][0]).toBe(projection.domNode);
    });

    it('invokes afterUpdate with "this" set to the value of the bind property', () => {
      let afterUpdate = vi.fn();
      let thisObject = vi.fn();
      let projection = dom.create(h("div", { afterUpdate: afterUpdate, bind: thisObject }));
      projection.update(h("div", { afterUpdate: afterUpdate, bind: thisObject }));
      expect(afterUpdate.mock.instances[0]).toBe(thisObject);
    });
  });
});
