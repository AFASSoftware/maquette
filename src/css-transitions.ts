import { TransitionStrategy, VNodeProperties } from "./maquette";

let browserSpecificTransitionEndEventName: "webkitTransitionEnd" | "transitionend";
let browserSpecificAnimationEndEventName: "webkitAnimationEnd" | "animationend";

let determineBrowserSpecificStyleNames = function (element: HTMLElement) {
  if ("WebkitTransition" in element.style) {
    browserSpecificTransitionEndEventName = "webkitTransitionEnd";
    browserSpecificAnimationEndEventName = "webkitAnimationEnd";
  } else if ("transition" in element.style) {
    browserSpecificTransitionEndEventName = "transitionend";
    browserSpecificAnimationEndEventName = "animationend";
  } else if ("MozTransition" in element.style) {
    browserSpecificTransitionEndEventName = "transitionend";
    browserSpecificAnimationEndEventName = "animationend";
  } else {
    throw new Error("Your browser is not supported!");
  }
};

let init = function (testElement: Element) {
  if (!browserSpecificTransitionEndEventName) {
    determineBrowserSpecificStyleNames(testElement as HTMLElement);
  }
};

export let cssTransitions: TransitionStrategy;

cssTransitions = {
  exit: function (element: Element, properties: VNodeProperties, exitAnimation: string, removeElement: () => void): void {
    init(element);
    let finished = false;
    let transitionEnd = function (evt: TransitionEvent) {
      if (!finished) {
        finished = true;
        element.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
        element.removeEventListener(browserSpecificAnimationEndEventName, transitionEnd);
        removeElement();
      }
    };
    element.classList.add(exitAnimation);
    element.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
    element.addEventListener(browserSpecificAnimationEndEventName, transitionEnd);
    requestAnimationFrame(function () {
      element.classList.add(exitAnimation + "-active");
    });
  },
  enter: function (element: Element, properties: VNodeProperties, enterAnimation: string): void {
    init(element);
    let finished = false;
    let transitionEnd = function (evt: TransitionEvent) {
      if (!finished) {
        finished = true;
        element.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
        element.removeEventListener(browserSpecificAnimationEndEventName, transitionEnd);
        element.classList.remove(enterAnimation);
        element.classList.remove(enterAnimation + "-active");
      }
    };
    element.classList.add(enterAnimation);
    element.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
    element.addEventListener(browserSpecificAnimationEndEventName, transitionEnd);
    requestAnimationFrame(function () {
      element.classList.add(enterAnimation + "-active");
    });
  }
};
