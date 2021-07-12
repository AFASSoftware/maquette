import * as path from "path";

import { SinonSpy } from "sinon";

import { ProjectorPerformanceLogger } from "../../src/interfaces";
import { expect, sinon } from "../test-utilities";

describe("windowPerformanceProjectorLogger", () => {
  /* eslint @typescript-eslint/no-var-requires: "off" */
  let window: {
    performance?: {
      mark: SinonSpy; // (markName: string): void;
      measure?: SinonSpy; // (measureName: string, startMarkName?: string, endMarkName?: string): void;
    };
  };

  // For this to work, we need to reload the source file to clear the cached prefixes
  let clearCachedRequires = () => {
    let sourceFile = path.normalize(
      path.join(__dirname, "../../src/utilities/window-performance-projector-logger.ts")
    );
    delete require.cache[sourceFile];
  };

  beforeEach(() => {
    clearCachedRequires();
    window = {
      performance: {
        mark: sinon.spy(),
        measure: sinon.spy(),
      },
    };
    (global as any).window = window;
  });
  let getLogger: () => ProjectorPerformanceLogger = () =>
    require("../../src/utilities/window-performance-projector-logger.ts")
      .windowPerformanceProjectorLogger;
  afterEach(() => {
    delete (global as any).window;
    clearCachedRequires();
  });

  it("does not do anything if the browser does not have a performance API", () => {
    delete window.performance.measure;
    let logger = getLogger();
    let event = {} as any;
    logger("domEvent", event);
    logger("domEventProcessed", event);
    expect(window.performance.mark).to.not.have.been.called;
  });

  it("reports dom event processing time", () => {
    let logger = getLogger();
    let event = {} as any;
    logger("domEvent", event);
    logger("domEventProcessed", event);
    expect(window.performance.measure).to.have.been.calledOnce;
  });

  it("reports render, diff+patch and renderCycle processing time", () => {
    let logger = getLogger();
    logger("renderStart", undefined);
    logger("rendered", undefined);
    logger("patched", undefined);
    // a second projection
    logger("rendered", undefined);
    logger("patched", undefined);
    logger("renderDone", undefined);
    let calls = window.performance.measure.getCalls().map((call) => call.args);
    expect(calls).to.deep.equal([
      ["render", "renderStart", "rendered"],
      ["diff+patch", "rendered", "patched"],
      ["render", "patched", "rendered"],
      ["diff+patch", "rendered", "patched"],
      ["renderCycle", "renderStart", "renderDone"],
    ]);
  });
});
