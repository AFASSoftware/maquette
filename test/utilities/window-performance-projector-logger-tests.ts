import { ProjectorPerformanceLogger } from "../../src/interfaces";
import { afterEach, beforeEach, describe, expect, it, vi } from "../test-utilities";

describe("windowPerformanceProjectorLogger", () => {
  let mockWindow: {
    performance?: {
      mark: ReturnType<typeof vi.fn>;
      measure?: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    // Reset module cache to clear cached prefixes
    vi.resetModules();

    mockWindow = {
      performance: {
        mark: vi.fn(),
        measure: vi.fn(),
      },
    };
    (global as any).window = mockWindow;
  });

  afterEach(() => {
    delete (global as any).window;
    vi.resetModules();
  });

  const getLogger = async (): Promise<ProjectorPerformanceLogger> => {
    const module = await import("../../src/utilities/window-performance-projector-logger");
    return module.windowPerformanceProjectorLogger;
  };

  it("does not do anything if the browser does not have a performance API", async () => {
    delete mockWindow.performance.measure;
    let logger = await getLogger();
    let event = {} as any;
    logger("domEvent", event);
    logger("domEventProcessed", event);
    expect(mockWindow.performance.mark).not.toHaveBeenCalled();
  });

  it("reports dom event processing time", async () => {
    let logger = await getLogger();
    let event = {} as any;
    logger("domEvent", event);
    logger("domEventProcessed", event);
    expect(mockWindow.performance.measure).toHaveBeenCalledTimes(1);
  });

  it("reports render, diff+patch and renderCycle processing time", async () => {
    let logger = await getLogger();
    logger("renderStart", undefined);
    logger("rendered", undefined);
    logger("patched", undefined);
    // a second projection
    logger("rendered", undefined);
    logger("patched", undefined);
    logger("renderDone", undefined);
    let calls = mockWindow.performance.measure.mock.calls.map((call) => call);
    expect(calls).toEqual([
      ["render", "renderStart", "rendered"],
      ["diff+patch", "rendered", "patched"],
      ["render", "patched", "rendered"],
      ["diff+patch", "rendered", "patched"],
      ["renderCycle", "renderStart", "renderDone"],
    ]);
  });
});
