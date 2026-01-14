import { MaquetteComponent, Projector, createProjector, dom, h } from "../src/index";
import { afterEach, beforeEach, describe, expect, it, vi } from "./test-utilities";

describe("Projector", () => {
  let requestAnimationFrame: ReturnType<typeof vi.fn>;
  let cancelAnimationFrame: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    requestAnimationFrame = vi.fn().mockReturnValue(5);
    cancelAnimationFrame = vi.fn();
    (global as any).requestAnimationFrame = requestAnimationFrame;
    (global as any).cancelAnimationFrame = cancelAnimationFrame;
  });

  afterEach(() => {
    delete (global as any).requestAnimationFrame;
    delete (global as any).cancelAnimationFrame;
  });

  it("renders the virtual DOM immediately when adding renderFunctions", () => {
    let parentElement = {
      appendChild: vi.fn(),
      insertBefore: vi.fn(),
      ownerDocument: {
        createElement: vi.fn((tag: string) => {
          return document.createElement(tag);
        }),
      },
      removeChild: vi.fn(),
    };
    let renderFunction = vi.fn().mockReturnValue(h("div", [h("span")]));
    let projector = createProjector({});

    // Append
    projector.append(parentElement as any, renderFunction);

    expect(renderFunction).toHaveBeenCalledTimes(1);
    expect(parentElement.ownerDocument.createElement).toHaveBeenCalledTimes(1);
    expect(parentElement.appendChild).toHaveBeenCalledTimes(1);
    expect(
      parentElement.appendChild.mock.calls[parentElement.appendChild.mock.calls.length - 1][0]
        .tagName
    ).toBe("DIV");

    // InsertBefore
    let siblingElement = {
      parentNode: parentElement,
    };

    projector.insertBefore(siblingElement as any, renderFunction);

    expect(renderFunction).toHaveBeenCalledTimes(2);
    expect(parentElement.insertBefore).toHaveBeenCalledTimes(1);
    expect(
      parentElement.insertBefore.mock.calls[parentElement.insertBefore.mock.calls.length - 1][0]
        .tagName
    ).toBe("DIV");
    expect(
      parentElement.insertBefore.mock.calls[parentElement.insertBefore.mock.calls.length - 1][1]
    ).toBe(siblingElement);

    // Merge
    let cleanRenderFunction = vi.fn().mockReturnValue(h("div", [h("span")]));

    let existingElement = {
      appendChild: vi.fn(),
      ownerDocument: {
        createElement: vi.fn((tag: string) => {
          return document.createElement(tag);
        }),
      },
    };

    projector.merge(existingElement as any, cleanRenderFunction);

    expect(cleanRenderFunction).toHaveBeenCalledTimes(1);
    expect(existingElement.ownerDocument.createElement).toHaveBeenCalledTimes(1);
    expect(existingElement.appendChild).toHaveBeenCalledTimes(1);
    expect(
      existingElement.appendChild.mock.calls[existingElement.appendChild.mock.calls.length - 1][0]
        .tagName
    ).toBe("SPAN");

    // Replace
    let oldElement = {
      parentNode: parentElement,
    };

    projector.replace(oldElement as any, renderFunction);

    expect(renderFunction).toHaveBeenCalledTimes(3);
    expect(parentElement.removeChild).toHaveBeenCalledTimes(1);
    expect(
      parentElement.removeChild.mock.calls[parentElement.removeChild.mock.calls.length - 1][0]
    ).toBe(oldElement);
    expect(parentElement.insertBefore).toHaveBeenCalledTimes(2);
    expect(
      parentElement.insertBefore.mock.calls[parentElement.insertBefore.mock.calls.length - 1][0]
        .tagName
    ).toBe("DIV");
    expect(
      parentElement.insertBefore.mock.calls[parentElement.insertBefore.mock.calls.length - 1][1]
    ).toBe(oldElement);

    // ScheduleRender

    projector.scheduleRender();
    expect(renderFunction).toHaveBeenCalledTimes(3);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    requestAnimationFrame.mock.calls[0][0]();
    expect(renderFunction).toHaveBeenCalledTimes(6);
  });

  it("Can stop and resume", () => {
    let projector = createProjector({});
    projector.scheduleRender();
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    requestAnimationFrame.mock.calls[0][0]();

    // Stop
    projector.stop();
    projector.scheduleRender();
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    // Resume
    projector.resume();
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
    requestAnimationFrame.mock.calls[1][0]();

    // Stopping before rendering
    projector.scheduleRender();
    expect(requestAnimationFrame).toHaveBeenCalledTimes(3);
    projector.stop();
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it("Stops when an error during rendering is encountered", () => {
    let projector = createProjector({});
    let parentElement = { appendChild: vi.fn(), ownerDocument: document };
    let renderFunction = vi.fn().mockReturnValue(h("div"));
    projector.append(parentElement as any, renderFunction);
    renderFunction.mockImplementation(() => {
      throw new Error("Rendering error");
    });
    projector.scheduleRender();
    expect(() => {
      requestAnimationFrame.mock.calls[0][0]();
    }).toThrow(Error);

    requestAnimationFrame.mock.calls[0][0]();

    renderFunction.mockClear();
    projector.scheduleRender();
    requestAnimationFrame.mock.calls[0][0]();
    expect(renderFunction).not.toHaveBeenCalled();

    requestAnimationFrame.mockClear();
    renderFunction.mockReturnValue(h("div"));
    projector.resume();
    requestAnimationFrame.mock.calls[0][0]();
    expect(renderFunction).toHaveBeenCalledTimes(1);
  });

  it("schedules a render when event handlers are called", () => {
    let projector = createProjector({});
    let parentElement = { appendChild: vi.fn(), ownerDocument: document };
    let handleClick = vi.fn();
    let renderFunction = () => h("button", { onclick: handleClick });
    projector.append(parentElement as any, renderFunction);

    let button = parentElement.appendChild.mock.calls[
      parentElement.appendChild.mock.calls.length - 1
    ][0] as HTMLElement;
    let evt = { currentTarget: button, type: "click" } as unknown as MouseEvent;

    expect(requestAnimationFrame).not.toHaveBeenCalled();

    button.onclick.apply(button, [evt]);

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(evt);
  });

  it('invokes the eventHandler with "this" set to the DOM node when no bind is present', () => {
    let parentElement = { appendChild: vi.fn(), ownerDocument: document };
    let projector = createProjector({});
    let handleClick = vi.fn();
    let renderFunction = () => h("button", { onclick: handleClick });
    projector.append(parentElement as any, renderFunction);

    let button = parentElement.appendChild.mock.calls[
      parentElement.appendChild.mock.calls.length - 1
    ][0] as HTMLElement;
    let clickEvent = { currentTarget: button, type: "click" };
    button.onclick(clickEvent as any); // Invoking onclick like this sets 'this' to the ButtonElement

    expect(handleClick).toHaveBeenCalledWith(clickEvent);
  });

  describe("Event handlers", () => {
    /**
     * A class/prototype based implementation of a Component
     *
     * NOTE: This is not our recommended way, but this is completely supported (using VNodeProperties.bind).
     */
    class ButtonComponent implements MaquetteComponent {
      private text: string;
      private clicked: (sender: ButtonComponent) => void;

      constructor(buttonText: string, buttonClicked: (sender: ButtonComponent) => void) {
        this.text = buttonText;
        this.clicked = buttonClicked;
      }

      public render() {
        return h("button", { onclick: this.handleClick, bind: this }, [this.text]);
      }

      private handleClick(evt: MouseEvent) {
        this.clicked(this);
      }
    }

    it('invokes the eventHandler with "this" set to the value of the bind property', () => {
      let clicked = vi.fn();
      let button = new ButtonComponent("Click me", clicked);

      let parentElement = {
        appendChild: vi.fn(),
        ownerDocument: document,
      };
      let projector = createProjector({});
      projector.append(parentElement as any, () => button.render());

      let buttonElement = parentElement.appendChild.mock.calls[
        parentElement.appendChild.mock.calls.length - 1
      ][0] as HTMLElement;
      let clickEvent = { currentTarget: buttonElement, type: "click" };
      buttonElement.onclick(clickEvent as any); // Invoking onclick like this sets 'this' to the ButtonElement

      expect(clicked).toHaveBeenCalledWith(button);
    });

    let allowsForEventHandlersToBeChanged = (createProjectorImpl: (arg: any) => Projector) => {
      let projector = createProjectorImpl({});
      let parentElement = {
        appendChild: vi.fn(),
        ownerDocument: document,
      };
      let eventHandler = vi.fn();

      let renderFunction = () =>
        h("div", [
          h("span", [
            h("button", {
              onclick: eventHandler,
            }),
          ]),
        ]);

      projector.append(parentElement as any, renderFunction);

      let div = parentElement.appendChild.mock.calls[
        parentElement.appendChild.mock.calls.length - 1
      ][0] as HTMLElement;
      let button = div.firstChild.firstChild as HTMLElement;
      let evt = {
        currentTarget: button,
        type: "click",
      } as unknown as MouseEvent;

      expect(eventHandler).not.toHaveBeenCalled();
      button.onclick.apply(button, [evt]);
      expect(eventHandler).toHaveBeenCalledTimes(1);

      // Simulate changing the event handler
      eventHandler = vi.fn();
      projector.renderNow();

      button.onclick.apply(button, [evt]);
      expect(eventHandler).toHaveBeenCalledTimes(1);
    };

    it("allows for eventHandlers to be changed", () =>
      allowsForEventHandlersToBeChanged(createProjector));

    it("will not call event handlers on domNodes which are no longer part of the rendered VNode", () => {
      let buttonVisible = true;
      let buttonBlur = vi.fn();
      let eventHandler = () => {
        buttonVisible = false;
      };
      let renderFunction = () =>
        h("div", [
          buttonVisible
            ? [
                h("button", {
                  onblur: buttonBlur,
                  onclick: eventHandler,
                }),
              ]
            : [],
        ]);

      let projector = createProjector({});
      let parentElement = document.createElement("section");
      projector.append(parentElement, renderFunction);
      let div = parentElement.firstChild as HTMLElement;
      let button = div.firstChild as HTMLButtonElement;
      button.onclick({ currentTarget: button, type: "click" } as any);
      expect(buttonVisible).toBe(false);
      projector.renderNow();
      // In reality, during renderNow(), the blur event fires just before its parentNode is cleared.
      // To simulate this we recreate that state in a new button object.
      let buttonBeforeBeingDetached = {
        onblur: button.onblur as (evt: Partial<Event>) => boolean,
        parentNode: div,
      };
      buttonBeforeBeingDetached.onblur({
        currentTarget: buttonBeforeBeingDetached,
        type: "blur",
      } as any);
      expect(buttonBlur).not.toHaveBeenCalled();
    });

    it("will not call event handlers on domNodes which are detached, like in exotic cases in Safari", () => {
      let buttonVisible = true;
      let buttonBlur = vi.fn();
      let eventHandler = () => {
        buttonVisible = false;
      };
      let renderFunction = () =>
        h("div", [
          buttonVisible
            ? [
                h("button", {
                  onblur: buttonBlur,
                  onclick: eventHandler,
                }),
              ]
            : [],
        ]);

      let projector = createProjector({});
      let parentElement = document.createElement("section");
      projector.append(parentElement, renderFunction);
      let div = parentElement.firstChild as HTMLElement;
      let button = div.firstChild as HTMLButtonElement;
      button.onclick({ currentTarget: button, type: "click" } as any);
      expect(buttonVisible).toBe(false);
      projector.renderNow();
      button.remove();

      let detachedButton = {
        onblur: button.onblur as (evt: Partial<Event>) => boolean,
        parentNode: null as any,
      };
      detachedButton.onblur({
        currentTarget: detachedButton,
        type: "blur",
      } as any);
      expect(buttonBlur).not.toHaveBeenCalled();
    });

    it('will call event handlers that were registered using "on" instead of "on<eventname>"', () => {
      let parentElement = { appendChild: vi.fn(), ownerDocument: document };
      let projector = createProjector({});
      let handleClick = vi.fn();
      let renderFunction = () => h("button", { on: { click: handleClick } });
      projector.append(parentElement as any, renderFunction);

      let button = parentElement.appendChild.mock.calls[
        parentElement.appendChild.mock.calls.length - 1
      ][0] as HTMLElement;
      button.dispatchEvent(new Event("click"));

      expect(handleClick).toHaveBeenCalled();
      expect(handleClick.mock.calls[handleClick.mock.calls.length - 1][0].type).toBe("click");
    });

    it('will call event handlers that were registered using "on" with options', () => {
      let parentElement = { appendChild: vi.fn(), ownerDocument: document };
      let projector = createProjector({});
      let handleClick = vi.fn();
      let renderFunction = () =>
        h("button", { on: { click: { listener: handleClick, options: { capture: true } } } });
      projector.append(parentElement as any, renderFunction);

      let button = parentElement.appendChild.mock.calls[
        parentElement.appendChild.mock.calls.length - 1
      ][0] as HTMLElement;
      button.dispatchEvent(new Event("click"));

      expect(handleClick).toHaveBeenCalled();
      expect(handleClick.mock.calls[handleClick.mock.calls.length - 1][0].type).toBe("click");
    });

    it("can add event handlers using on without an interceptor", () => {
      let parentElement = { appendChild: vi.fn(), ownerDocument: document };
      let onClick = vi.fn();
      dom.append(parentElement as unknown as HTMLElement, h("button", { on: { click: onClick } }));
      let button = parentElement.appendChild.mock.calls[
        parentElement.appendChild.mock.calls.length - 1
      ][0] as HTMLElement;
      button.dispatchEvent(new Event("click"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("can handle interceptors removing event handlers", () => {
      let parentElement = { appendChild: vi.fn(), ownerDocument: document };
      let onClick = vi.fn();
      dom.append(parentElement as unknown as HTMLElement, h("button", { on: { click: onClick } }), {
        eventHandlerInterceptor: () => undefined,
      });
      let button = parentElement.appendChild.mock.calls[
        parentElement.appendChild.mock.calls.length - 1
      ][0] as HTMLElement;
      button.dispatchEvent(new Event("click"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  it("can detach a projection", () => {
    let parentElement = { appendChild: vi.fn(), ownerDocument: document };
    let projector = createProjector({});
    let renderFunction = () => h("textarea#t1");
    let renderFunction2 = () => h("textarea#t2");
    projector.append(parentElement as any, renderFunction);
    projector.append(parentElement as any, renderFunction2);

    let projection = projector.detach(renderFunction);
    expect(projection.domNode.id).toBe("t1");

    expect(() => {
      projector.detach(renderFunction);
    }).toThrow();
  });
});
