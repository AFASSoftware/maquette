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
    throw new Error("Your browser is not supported");
  }
};

let init = function (testElement: Element) {
  if (browserSpecificTransitionEndEventName === null) {
    determineBrowserSpecificStyleNames(testElement as HTMLElement);
  }
};

export let cssTransitions: TransitionStrategy;

cssTransitions = {
  exit: function (node: Element, properties: VNodeProperties, exitAnimation: string, removeNode: () => void): void {
    init(node);
    let finished = false;
    let transitionEnd = function (evt: TransitionEvent) {
      if (!finished) {
        finished = true;
        node.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
        node.removeEventListener(browserSpecificAnimationEndEventName, transitionEnd);
        removeNode();
      }
    };
    node.classList.add(exitAnimation);
    node.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
    node.addEventListener(browserSpecificAnimationEndEventName, transitionEnd);
    requestAnimationFrame(function () {
      node.classList.add(exitAnimation + "-active");
    });
  },
  enter: function (node: Element, properties: VNodeProperties, enterAnimation: string): void {
    init(node);
    let finished = false;
    let transitionEnd = function (evt: TransitionEvent) {
      if (!finished) {
        finished = true;
        node.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
        node.removeEventListener(browserSpecificAnimationEndEventName, transitionEnd);
        node.classList.remove(enterAnimation);
        node.classList.remove(enterAnimation + "-active");
      }
    };
    node.classList.add(enterAnimation);
    node.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
    node.addEventListener(browserSpecificAnimationEndEventName, transitionEnd);
    requestAnimationFrame(function () {
      node.classList.add(enterAnimation + "-active");
    });
  }
};
