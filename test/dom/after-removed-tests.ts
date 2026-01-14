import { dom, h } from "../../src";
import { afterEach, beforeEach, describe, expect, it, vi } from "../test-utilities";

describe("dom", () => {
  describe("afterRemoved", () => {
    let requestIdleCallback: ReturnType<typeof vi.fn>;
    let clock: { tick: (ms: number) => void; restore: () => void };

    beforeEach(() => {
      requestIdleCallback = vi.fn();
      (global as any).window = { requestIdleCallback };
      vi.useFakeTimers();
      clock = {
        tick: (ms: number) => vi.advanceTimersByTime(ms),
        restore: () => vi.useRealTimers(),
      };
    });

    afterEach(() => {
      delete (global as any).window;
      clock.restore();
    });

    it("will call afterRemoved eventually on all nodes that are no longer in the DOM", () => {
      let afterRemoved1 = vi.fn();
      let afterRemoved2 = vi.fn();

      let projection = dom.create(
        h("div", [
          h("div.1", {}, [
            h("div.2", { afterRemoved: afterRemoved1 }, [
              h("div.3", {}, [h("div.4", { afterRemoved: afterRemoved2 }, [])]),
            ]),
          ]),
        ])
      );
      projection.update(h("div", []));

      expect(requestIdleCallback).toHaveBeenCalledTimes(1);

      // Call the callback
      requestIdleCallback.mock.calls[0][0]();

      expect(afterRemoved1).toHaveBeenCalled();
      expect(afterRemoved2).toHaveBeenCalled();
    });

    it("will request a single idle callback when multiple nodes are removed", () => {
      let afterRemoved1 = vi.fn();
      let afterRemoved2 = vi.fn();
      let projection = dom.create(
        h("div", [
          h("div.1", { afterRemoved: afterRemoved1 }),
          h("div.2", { afterRemoved: afterRemoved2 }),
        ])
      );
      projection.update(h("div", []));

      expect(requestIdleCallback).toHaveBeenCalledTimes(1);

      requestIdleCallback.mock.calls[0][0]();

      expect(afterRemoved1).toHaveBeenCalled();
      expect(afterRemoved2).toHaveBeenCalled();
    });

    it("will use setTimeout when requestIdleCallback is not available", () => {
      delete (global as any).window;

      let afterRemoved = vi.fn();
      let projection = dom.create(h("div", [h("div", { afterRemoved })]));

      projection.update(h("div", []));

      expect(afterRemoved).not.toHaveBeenCalled();
      clock.tick(16);
      expect(afterRemoved).toHaveBeenCalled();
    });

    it("will be invoked with the removed dom node when a node has been removed from the tree", () => {
      requestIdleCallback.mockImplementation((cb: () => void) => cb());

      let afterRemoved = vi.fn();
      let projection = dom.create(h("div", [h("div", { afterRemoved })]));

      let domNode = projection.domNode.children[0];
      projection.update(h("div", []));

      expect(afterRemoved).toHaveBeenCalledWith(domNode);
    });

    it('will be invoked with "this" set to the value of the bind property', () => {
      requestIdleCallback.mockImplementation((cb: () => void) => cb());

      let afterRemoved = vi.fn();
      let thisObject = vi.fn();
      let projection = dom.create(h("div", [h("div", { afterRemoved, bind: thisObject })]));
      projection.update(h("div", []));

      expect(afterRemoved.mock.instances[0]).toBe(thisObject);
    });

    it("will be invoked when the exit animation is done", () => {
      requestIdleCallback.mockImplementation((cb: () => void) => cb());

      let afterRemoved = vi.fn();
      let projection = dom.create(
        h("div", [
          h("div", {
            afterRemoved,
            exitAnimation: (element, removeElement) => removeElement(),
          }),
        ])
      );
      projection.update(h("div", []));

      expect(afterRemoved).toHaveBeenCalled();
    });
  });
});
