// Comment that is displayed in the API documentation for the maquette module:
/**
 * Welcome to the API documentation of the **maquette** library.
 *
 * [[http://maquettejs.org/|To the maquette homepage]]
 */

/**
 * A virtual representation of a DOM Node. Maquette assumes that [[VNode]] objects are never modified externally.
 * Instances of [[VNode]] can be created using [[h]].
 */
export interface VNode {
  /**
   * The CSS selector containing tagname, css classnames and id. An empty string is used to denote a text node.
   */
  vnodeSelector: string;
  /**
   * Object containing attributes, properties, event handlers and more, see [[h]].
   */
  properties: VNodeProperties;
  /**
   * Array of [[VNode]]s to be used as children. This array is already flattened.
   */
  children: Array<VNode>;
  /**
   * Used in a special case when a [[VNode]] only has one childnode which is a textnode. Only used in combination with children === undefined.
   */
  text: string;
  /**
   * Used by maquette to store the domNode that was produced from this [[VNode]].
   */
  domNode: Node;
}

/**
 * A projector is used to create the real DOM from the the virtual DOM and to keep it up-to-date afterwards.
 *
 * You can call [[append]], [[merge]], [[insertBefore]] and [[replace]] to add the virtual DOM to the real DOM.
 * The `renderMaquetteFunction` callbacks will be called to create the real DOM immediately.
 * Afterwards, the `renderMaquetteFunction` callbacks will be called again to update the DOM on the next animation-frame after:
 *
 *  - The Projector's [[scheduleRender]] function  was called
 *  - An event handler (like `onclick`) on a rendered [[VNode]] was called.
 *
 * The projector stops when [[stop]] is called or when an error is thrown during rendering.
 * It is possible to use `window.onerror` to handle these errors.
 * Instances of [[Projector]] can be created using [[createProjector]].
 */
export interface Projector {
  /**
   * Appends a new childnode to the DOM using the result from the provided `renderMaquetteFunction`.
   * The `renderMaquetteFunction` will be invoked again to update the DOM when needed.
   * @param parentNode - The parent node for the new childNode.
   * @param renderMaquetteFunction - Function with zero arguments that returns a [[VNode]] tree.
   */
  append(parentNode: Element, renderMaquetteFunction: () => VNode): void;
  /**
   * Inserts a new DOM node using the result from the provided `renderMaquetteFunction`.
   * The `renderMaquetteFunction` will be invoked again to update the DOM when needed.
   * @param beforeNode - The node that the DOM Node is inserted before.
   * @param renderMaquetteFunction - Function with zero arguments that returns a [[VNode]] tree.
   */
  insertBefore(beforeNode: Element, renderMaquetteFunction: () => VNode): void;
  /**
   * Merges a new DOM node using the result from the provided `renderMaquetteFunction` with an existing DOM Node.
   * This means that the virtual DOM and real DOM have one overlapping element.
   * Therefore the selector for the root [[VNode]] will be ignored, but its properties and children will be applied to the Element provided
   * The `renderMaquetteFunction` will be invoked again to update the DOM when needed.
   * @param domNode - The existing element to adopt as the root of the new virtual DOM. Existing attributes and childnodes are preserved.
   * @param renderMaquetteFunction - Function with zero arguments that returns a [[VNode]] tree.
   */
  merge(domNode: Element, renderMaquetteFunction: () => VNode): void;
  /**
   * Replaces an existing DOM node with the result from the provided `renderMaquetteFunction`.
   * The `renderMaquetteFunction` will be invoked again to update the DOM when needed.
   * @param domNode - The DOM node to replace.
   * @param renderMaquetteFunction - Function with zero arguments that returns a [[VNode]] tree.
   */
  replace(domNode: Element, renderMaquetteFunction: () => VNode): void;
  /**
   * Resumes the projector. Use this method to resume rendering after [[stop]] was called or an error occurred during rendering.
   */
  resume(): void;
  /**
   * Instructs the projector to re-render to the DOM at the next animation-frame using the registered `renderMaquette` functions.
   * This method is automatically called for you when event-handlers that are registered in the [[VNode]]s are invoked.
   *
   * You need to call this method when timeouts expire, when AJAX responses arrive or other asynchronous actions happen.
   */
  scheduleRender(): void;
  /**
   * Stops the projector. This means that the registered `renderMaquette` functions will not be called anymore.
   *
   * Note that calling [[stop]] is not mandatory. A projector is a passive object that will get garbage collected
   * as usual if it is no longer in scope.
   */
  stop(): void;
}

/**
 * These functions are called when [[VNodeProperties.enterAnimation]] and [[VNodeProperties.exitAnimation]] are provided as strings.
 * See [[ProjectionOptions.transitions]].
 */
export interface TransitionStrategy {
  /**
   * Function that is called when a [[VNode]] with an `enterAnimation` string is added to an already existing parent [[VNode]].
   *
   * @param element         Element that was just added to the DOM.
   * @param properties      The properties object that was supplied to the [[h]] method
   * @param enterAnimation  The string that was passed to [[VNodeProperties.enterAnimation]].
   */
  enter(element: Element, properties: VNodeProperties, enterAnimation: string): void;
  /**
   * Function that is called when a [[VNode]] with an `exitAnimation` string is removed from a existing parent [[VNode]] that remains.
   *
   * @param element         Element that ought to be removed from to the DOM.
   * @param properties      The properties object that was supplied to the [[h]] method that rendered this [[VNode]] the previous time.
   * @param exitAnimation   The string that was passed to [[VNodeProperties.exitAnimation]].
   * @param removeElement   Function that removes the element from the DOM.
   *                        This argument is provided purely for convenience.
   *                        You may use this function to remove the element when the animation is done.
   */
  exit(element: Element, properties: VNodeProperties, exitAnimation: string, removeElement: () => void): void;
};

/**
 * Options that influence how the DOM is rendered and updated.
 */
export interface ProjectionOptions {
  /**
   * A transition strategy to invoke when enterAnimation and exitAnimation properties are provided as strings.
   * The module `cssTransitions` in the provided `css-transitions.js` file provides such a strategy.
   * A transition strategy is not needed when enterAnimation and exitAnimation properties are provided as functions.
   */
  transitions?: TransitionStrategy;
  /**
   * Only for internal use. Used for rendering SVG Nodes.
   */
  namespace?: string;
  /**
   * Only for internal use. Used to wrap eventHandlers to call [[scheduleRender]] on the [[Projector]].
   */
  eventHandlerInterceptor?: Function;
  /**
   * May be used to add vendor prefixes when applying inline styles when needed.
   * This function is called when [[styles]] is used.
   * This function should execute `domNode.style[styleName] = value` or do something smarter.
   *
   * @param domNode   The DOM Node that needs to receive the style
   * @param styleName The name of the style that should be applied, for example `transform`.
   * @param value     The value of this style, for example `rotate(45deg)`.
   */
  styleApplyer?(domNode: HTMLElement, styleName: string, value: string): void;
};

/**
 * Object containing attributes, properties, event handlers and more that can be put on DOM nodes.
 *
 * For your convenience, all common attributes, properties and event handlers are listed here and are
 * type-checked when using Typescript.
 */
export interface VNodeProperties {
  /**
   * The animation to perform when this node is added to an already existing parent.
   * When this value is a string, you must pass a `projectionOptions.transitions` object when creating the
   * projector using [[createProjector]].
   * {@link http://maquettejs.org/docs/animations.html|More about animations}.
   * @param element - Element that was just added to the DOM.
   * @param properties - The properties object that was supplied to the [[h]] method
   */
  enterAnimation?: ((element: Element, properties?: VNodeProperties) => void) | string;
  /**
   * The animation to perform when this node is removed while its parent remains.
   * When this value is a string, you must pass a `projectionOptions.transitions` object when creating the projector using [[createProjector]].
   * {@link http://maquettejs.org/docs/animations.html|More about animations}.
   * @param element - Element that ought to be removed from to the DOM.
   * @param removeElement - Function that removes the element from the DOM.
   * This argument is provided purely for convenience.
   * You may use this function to remove the element when the animation is done.
   * @param properties - The properties object that was supplied to the [[h]] method that rendered this [[VNode]] the previous time.
   */
  exitAnimation?: ((element: Element, removeElement: () => void, properties?: VNodeProperties) => void) | string;
  /**
   * The animation to perform when the properties of this node change.
   * This also includes attributes, styles, css classes. This callback is also invoked when node contains only text and that text changes.
   * {@link http://maquettejs.org/docs/animations.html|More about animations}.
   * @param element - Element that was modified in the DOM.
   * @param properties - The last properties object that was supplied to the [[h]] method
   * @param previousProperties - The previous properties object that was supplied to the [[h]] method
   */
  updateAnimation?: (element: Element, properties?: VNodeProperties, previousProperties?: VNodeProperties) => void;
  /**
   * Callback that is executed after this node is added to the DOM. Childnodes and properties have
   * already been applied.
   * @param element - The element that was added to the DOM.
   * @param projectionOptions - The projection options that were used see [[createProjector]].
   * @param vnodeSelector - The selector passed to the [[h]] function.
   * @param properties - The properties passed to the [[h]] function.
   * @param children - The children that were created.
   * @param properties - The last properties object that was supplied to the [[h]] method
   * @param previousProperties - The previous properties object that was supplied to the [[h]] method
   */
  afterCreate?(element: Element, projectionOptions: ProjectionOptions, vnodeSelector: string, properties: VNodeProperties,
    children: VNode[]): void;
  /**
   * Callback that is executed every time this node may have been updated. Childnodes and properties
   * have already been updated.
   * @param element - The element that may have been updated in the DOM.
   * @param projectionOptions - The projection options that were used see [[createProjector]].
   * @param vnodeSelector - The selector passed to the [[h]] function.
   * @param properties - The properties passed to the [[h]] function.
   * @param children - The children for this node.
   */
  afterUpdate?(element: Element, projectionOptions: ProjectionOptions, vnodeSelector: string, properties: VNodeProperties,
    children: VNode[]): void;
  /**
   * Used to uniquely identify a DOM node among siblings.
   * A key is required when there are more children with the same selector and these children are added or removed dynamically.
   * NOTE: this does not have to be a string or number, a [[Component]] Object for instance is also possible.
   */
  key?: Object;
  /**
   * An object literal like `{important:true}` which allows css classes, like `important` to be added and removed
   * dynamically.
   */
  classes?: { [index: string]: boolean };
  /**
   * An object literal like `{height:'100px'}` which allows styles to be changed dynamically. All values must be strings.
   */
  styles?: { [index: string]: string };

  // From Element
  ontouchcancel?(ev?: TouchEvent): boolean | void;
  ontouchend?(ev?: TouchEvent): boolean | void;
  ontouchmove?(ev?: TouchEvent): boolean | void;
  ontouchstart?(ev?: TouchEvent): boolean | void;
  // From HTMLFormElement
  action?: string;
  encoding?: string;
  enctype?: string;
  method?: string;
  name?: string;
  target?: string;
  // From HTMLElement
  onblur?(ev?: FocusEvent): boolean | void;
  onchange?(ev?: Event): boolean | void;
  onclick?(ev?: MouseEvent): boolean | void;
  ondblclick?(ev?: MouseEvent): boolean | void;
  onfocus?(ev?: FocusEvent): boolean | void;
  oninput?(ev?: Event): boolean | void;
  onkeydown?(ev?: KeyboardEvent): boolean | void;
  onkeypress?(ev?: KeyboardEvent): boolean | void;
  onkeyup?(ev?: KeyboardEvent): boolean | void;
  onload?(ev?: Event): boolean | void;
  onmousedown?(ev?: MouseEvent): boolean | void;
  onmouseenter?(ev?: MouseEvent): boolean | void;
  onmouseleave?(ev?: MouseEvent): boolean | void;
  onmousemove?(ev?: MouseEvent): boolean | void;
  onmouseout?(ev?: MouseEvent): boolean | void;
  onmouseover?(ev?: MouseEvent): boolean | void;
  onmouseup?(ev?: MouseEvent): boolean | void;
  onmousewheel?(ev?: MouseWheelEvent): boolean | void;
  onscroll?(ev?: UIEvent): boolean | void;
  onsubmit?(ev?: Event): boolean | void;
  spellcheck?: boolean;
  tabIndex?: number;
  title?: string;
  accessKey?: string;
  id?: string;
  // From HTMLInputElement
  autocomplete?: string;
  checked?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  src?: string;
  value?: string;
  // From HTMLImageElement
  alt?: string;
  srcset?: string;

  /**
   * Everything that is not explicitly listed (properties and attributes that are either uncommon or custom).
   */
  [index: string]: any;
};

/**
 * Represents a [[VNode]] tree that has been rendered to a real DOM tree.
 */
export interface Projection {
  /**
   * The DOM node that is used as the root of this [[Projection]].
   */
  domNode: Element;
  /**
   * Updates the real DOM to match the new virtual DOM tree.
   * @param updatedVnode The updated virtual DOM tree. Note: The selector for the root of the [[VNode]] tree may not change.
   */
  update(updatedVnode: VNode): void;
}

const NAMESPACE_SVG = 'http://www.w3.org/2000/svg';

// Utilities

let emptyArray = <VNode[]>[];

let extend = <T>(base: T, overrides: any): T => {
  let result = {} as any;
  Object.keys(base).forEach(function(key) {
    result[key] = (base as any)[key];
  });
  if (overrides) {
    Object.keys(overrides).forEach((key) => {
      result[key] = overrides[key];
    });
  }
  return result;
};

// Hyperscript helper functions

let same = (vnode1: VNode, vnode2: VNode) => {
  if (vnode1.vnodeSelector !== vnode2.vnodeSelector) {
    return false;
  }
  if (vnode1.properties && vnode2.properties) {
    return vnode1.properties.key === vnode2.properties.key;
  }
  return !vnode1.properties && !vnode2.properties;
};

let toTextVNode = (data: any): VNode => {
  return {
    vnodeSelector: '',
    properties: undefined,
    children: undefined,
    text: data.toString(),
    domNode: null
  };
};

let appendChildren = function(parentSelector: string, insertions: any[], main: VNode[]) {
  for (let i = 0; i < insertions.length; i++) {
    let item = insertions[i];
    if (Array.isArray(item)) {
      appendChildren(parentSelector, item, main);
    } else {
      if (item !== null && item !== undefined) {
        if (!item.hasOwnProperty('vnodeSelector')) {
          item = toTextVNode(item);
        }
        main.push(item);
      }
    }
  }
};

// Render helper functions

let missingTransition = function() {
  throw new Error('Provide a transitions object to the projectionOptions to do animations');
};

const DEFAULT_PROJECTION_OPTIONS: ProjectionOptions = {
  namespace: undefined,
  eventHandlerInterceptor: undefined,
  styleApplyer: function(domNode: HTMLElement, styleName: string, value: string) {
    // Provides a hook to add vendor prefixes for browsers that still need it.
    (domNode.style as any)[styleName] = value;
  },
  transitions: {
    enter: missingTransition,
    exit: missingTransition
  }
};

let applyDefaultProjectionOptions = function(projectionOptions: ProjectionOptions) {
  return extend(DEFAULT_PROJECTION_OPTIONS, projectionOptions);
};

let checkStyleValue = (styleValue: Object) => {
  if (typeof styleValue !== 'string') {
    throw new Error('Style values must be strings');
  }
};

let setProperties = function(domNode: Node, properties: VNodeProperties, projectionOptions: ProjectionOptions) {
  if (!properties) {
    return;
  }
  let eventHandlerInterceptor = projectionOptions.eventHandlerInterceptor;
  let propNames = Object.keys(properties);
  let propCount = propNames.length;
  for (let i = 0; i < propCount; i++) {
    let propName = propNames[i];
    /* tslint:disable:no-var-keyword: edge case */
    var propValue = properties[propName];
    /* tslint:enable:no-var-keyword */
    if (propName === 'className') {
      throw new Error('Property "className" is not supported, use "class".');
    } else if (propName === 'class') {
      if ((domNode as Element).className) {
        // May happen if classes is specified before class
        (domNode as Element).className += ' ' + propValue;
      } else {
        (domNode as Element).className = propValue;
      }
    } else if (propName === 'classes') {
      // object with string keys and boolean values
      let classNames = Object.keys(propValue);
      let classNameCount = classNames.length;
      for (let j = 0; j < classNameCount; j++) {
        let className = classNames[j];
        if (propValue[className]) {
          (domNode as Element).classList.add(className);
        }
      }
    } else if (propName === 'styles') {
      // object with string keys and string (!) values
      let styleNames = Object.keys(propValue);
      let styleCount = styleNames.length;
      for (let j = 0; j < styleCount; j++) {
        let styleName = styleNames[j];
        let styleValue = propValue[styleName];
        if (styleValue) {
          checkStyleValue(styleValue);
          projectionOptions.styleApplyer(<HTMLElement>domNode, styleName, styleValue);
        }
      }
    } else if (propName === 'key') {
      continue;
    } else if (propValue === null || propValue === undefined) {
      continue;
    } else {
      let type = typeof propValue;
      if (type === 'function') {
        if (eventHandlerInterceptor && (propName.lastIndexOf('on', 0) === 0)) { // lastIndexOf(,0)===0 -> startsWith
          propValue = eventHandlerInterceptor(propName, propValue, domNode, properties); // intercept eventhandlers
          if (propName === 'oninput') {
            (function() {
              // record the evt.target.value, because IE sometimes does a requestAnimationFrame between changing value and running oninput
              let oldPropValue = propValue;
              propValue = function(evt: Event) {
                (evt.target as any)['oninput-value'] = (evt.target as HTMLInputElement).value; // may be HTMLTextAreaElement as well
                oldPropValue.apply(this, [evt]);
              };
            } ());
          }
        }
        (domNode as any)[propName] = propValue;
      } else if (type === 'string' && propName !== 'value') {
        (domNode as Element).setAttribute(propName, propValue);
      } else {
        (domNode as any)[propName] = propValue;
      }
    }
  }
};

let updateProperties = function(domNode: Node, previousProperties: VNodeProperties, properties: VNodeProperties, projectionOptions: ProjectionOptions) {
  if (!properties) {
    return;
  }
  let propertiesUpdated = false;
  let propNames = Object.keys(properties);
  let propCount = propNames.length;
  for (let i = 0; i < propCount; i++) {
    let propName = propNames[i];
    // assuming that properties will be nullified instead of missing is by design
    let propValue = properties[propName];
    let previousValue = previousProperties[propName];
    if (propName === 'class') {
      if (previousValue !== propValue) {
        throw new Error('"class" property may not be updated. Use the "classes" property for conditional css classes.');
      }
    } else if (propName === 'classes') {
      let classList = (domNode as Element).classList;
      let classNames = Object.keys(propValue);
      let classNameCount = classNames.length;
      for (let j = 0; j < classNameCount; j++) {
        let className = classNames[j];
        let on = !!propValue[className];
        let previousOn = !!previousValue[className];
        if (on === previousOn) {
          continue;
        }
        propertiesUpdated = true;
        if (on) {
          classList.add(className);
        } else {
          classList.remove(className);
        }
      }
    } else if (propName === 'styles') {
      let styleNames = Object.keys(propValue);
      let styleCount = styleNames.length;
      for (let j = 0; j < styleCount; j++) {
        let styleName = styleNames[j];
        let newStyleValue = propValue[styleName];
        let oldStyleValue = previousValue[styleName];
        if (newStyleValue === oldStyleValue) {
          continue;
        }
        propertiesUpdated = true;
        if (newStyleValue) {
          checkStyleValue(newStyleValue);
          projectionOptions.styleApplyer(domNode as HTMLElement, styleName, newStyleValue);
        } else {
          projectionOptions.styleApplyer(domNode as HTMLElement, styleName, '');
        }
      }
    } else {
      if (!propValue && typeof previousValue === 'string') {
        propValue = '';
      }
      if (propName === 'value') { // value can be manipulated by the user directly and using event.preventDefault() is not an option
        if ((domNode as any)[propName] !== propValue && (domNode as any)['oninput-value'] !== propValue) {
          (domNode as any)[propName] = propValue; // Reset the value, even if the virtual DOM did not change
          (domNode as any)['oninput-value'] = undefined;
        } // else do not update the domNode, otherwise the cursor position would be changed
        if (propValue !== previousValue) {
          propertiesUpdated = true;
        }
      } else if (propValue !== previousValue) {
        let type = typeof propValue;
        if (type === 'function') {
          throw new Error('Functions may not be updated on subsequent renders (property: ' + propName +
            '). Hint: declare event handler functions outside the render() function.');
        }
        if (type === 'string') {
          (domNode as Element).setAttribute(propName, propValue);
        } else {
          if ((domNode as any)[propName] !== propValue) { // Comparison is here for side-effects in Edge with scrollLeft and scrollTop
            (domNode as any)[propName] = propValue;
          }
        }
        propertiesUpdated = true;
      }
    }
  }
  return propertiesUpdated;
};

let findIndexOfChild = function(children: VNode[], sameAs: VNode, start: number) {
  if (sameAs.vnodeSelector !== '') {
    // Never scan for text-nodes
    for (let i = start; i < children.length; i++) {
      if (same(children[i], sameAs)) {
        return i;
      }
    }
  }
  return -1;
};

let nodeAdded = function(vNode: VNode, transitions: TransitionStrategy) {
  if (vNode.properties) {
    let enterAnimation = vNode.properties.enterAnimation;
    if (enterAnimation) {
      if (typeof enterAnimation === 'function') {
        enterAnimation(vNode.domNode as Element, vNode.properties);
      } else {
        transitions.enter(vNode.domNode as Element, vNode.properties, enterAnimation as string);
      }
    }
  }
};

let nodeToRemove = function(vNode: VNode, transitions: TransitionStrategy) {
  let domNode = vNode.domNode;
  if (vNode.properties) {
    let exitAnimation = vNode.properties.exitAnimation;
    if (exitAnimation) {
      (domNode as HTMLElement).style.pointerEvents = 'none';
      let removeDomNode = function() {
        if (domNode.parentNode) {
          domNode.parentNode.removeChild(domNode);
        }
      };
      if (typeof exitAnimation === 'function') {
        exitAnimation(domNode as Element, removeDomNode, vNode.properties);
        return;
      } else {
        transitions.exit(vNode.domNode as Element, vNode.properties, exitAnimation as string, removeDomNode);
        return;
      }
    }
  }
  if (domNode.parentNode) {
    domNode.parentNode.removeChild(domNode);
  }
};

let checkDistinguishable = function(childNodes: VNode[], indexToCheck: number, parentVNode: VNode, operation: string) {
  let childNode = childNodes[indexToCheck];
  if (childNode.vnodeSelector === '') {
    return; // Text nodes need not be distinguishable
  }
  let key = childNode.properties ? childNode.properties.key : undefined;
  if (!key) { // A key is just assumed to be unique
    for (let i = 0; i < childNodes.length; i++) {
      if (i !== indexToCheck) {
        let node = childNodes[i];
        if (same(node, childNode)) {
          if (operation === 'added') {
            throw new Error(parentVNode.vnodeSelector + ' had a ' + childNode.vnodeSelector + ' child ' +
              'added, but there is now more than one. You must add unique key properties to make them distinguishable.');
          } else {
            throw new Error(parentVNode.vnodeSelector + ' had a ' + childNode.vnodeSelector + ' child ' +
              'removed, but there were more than one. You must add unique key properties to make them distinguishable.');
          }
        }
      }
    }
  }
};

let createDom: (vnode: VNode, parentNode: Node, insertBefore: Node, projectionOptions: ProjectionOptions) => void;
let updateDom: (previous: VNode, vnode: VNode, projectionOptions: ProjectionOptions) => boolean;

let updateChildren = function(vnode: VNode, domNode: Node, oldChildren: VNode[], newChildren: VNode[], projectionOptions: ProjectionOptions) {
  if (oldChildren === newChildren) {
    return false;
  }
  oldChildren = oldChildren || emptyArray;
  newChildren = newChildren || emptyArray;
  let oldChildrenLength = oldChildren.length;
  let newChildrenLength = newChildren.length;
  let transitions = projectionOptions.transitions;

  let oldIndex = 0;
  let newIndex = 0;
  let i: number;
  let textUpdated = false;
  while (newIndex < newChildrenLength) {
    let oldChild = (oldIndex < oldChildrenLength) ? oldChildren[oldIndex] : undefined;
    let newChild = newChildren[newIndex];
    if (oldChild !== undefined && same(oldChild, newChild)) {
      textUpdated = updateDom(oldChild, newChild, projectionOptions) || textUpdated;
      oldIndex++;
    } else {
      let findOldIndex = findIndexOfChild(oldChildren, newChild, oldIndex + 1);
      if (findOldIndex >= 0) {
        // Remove preceding missing children
        for (i = oldIndex; i < findOldIndex; i++) {
          nodeToRemove(oldChildren[i], transitions);
          checkDistinguishable(oldChildren, i, vnode, 'removed');
        }
        textUpdated = updateDom(oldChildren[findOldIndex], newChild, projectionOptions) || textUpdated;
        oldIndex = findOldIndex + 1;
      } else {
        // New child
        createDom(newChild, domNode, (oldIndex < oldChildrenLength) ? oldChildren[oldIndex].domNode : undefined, projectionOptions);
        nodeAdded(newChild, transitions);
        checkDistinguishable(newChildren, newIndex, vnode, 'added');
      }
    }
    newIndex++;
  }
  if (oldChildrenLength > oldIndex) {
    // Remove child fragments
    for (i = oldIndex; i < oldChildrenLength; i++) {
      nodeToRemove(oldChildren[i], transitions);
      checkDistinguishable(oldChildren, i, vnode, 'removed');
    }
  }
  return textUpdated;
};

let addChildren = function(domNode: Node, children: VNode[], projectionOptions: ProjectionOptions) {
  if (!children) {
    return;
  }
  for (let i = 0; i < children.length; i++) {
    createDom(children[i], domNode, undefined, projectionOptions);
  }
};

let initPropertiesAndChildren = function(domNode: Node, vnode: VNode, projectionOptions: ProjectionOptions) {
  addChildren(domNode, vnode.children, projectionOptions); // children before properties, needed for value property of <select>.
  if (vnode.text) {
    domNode.textContent = vnode.text;
  }
  setProperties(domNode, vnode.properties, projectionOptions);
  if (vnode.properties && vnode.properties.afterCreate) {
    vnode.properties.afterCreate(domNode as Element, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children);
  }
};

createDom = function(vnode, parentNode, insertBefore, projectionOptions) {
  let domNode: Node, i: number, c: string, start = 0, type: string, found: string;
  let vnodeSelector = vnode.vnodeSelector;
  if (vnodeSelector === '') {
    domNode = vnode.domNode = document.createTextNode(vnode.text);
    if (insertBefore !== undefined) {
      parentNode.insertBefore(domNode, insertBefore);
    } else {
      parentNode.appendChild(domNode);
    }
  } else {
    for (i = 0; i <= vnodeSelector.length; ++i) {
      c = vnodeSelector.charAt(i);
      if (i === vnodeSelector.length || c === '.' || c === '#') {
        type = vnodeSelector.charAt(start - 1);
        found = vnodeSelector.slice(start, i);
        if (type === '.') {
          (domNode as HTMLElement).classList.add(found);
        } else if (type === '#') {
          (domNode as Element).id = found;
        } else {
          if (found === 'svg') {
            projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
          }
          if (projectionOptions.namespace !== undefined) {
            domNode = vnode.domNode = document.createElementNS(projectionOptions.namespace, found);
          } else {
            domNode = vnode.domNode = document.createElement(found);
          }
          if (insertBefore !== undefined) {
            parentNode.insertBefore(domNode, insertBefore);
          } else {
            parentNode.appendChild(domNode);
          }
        }
        start = i + 1;
      }
    }
    initPropertiesAndChildren(domNode, vnode, projectionOptions);
  }
};

updateDom = function(previous, vnode, projectionOptions) {
  let domNode = previous.domNode;
  let textUpdated = false;
  if (previous === vnode) {
    return textUpdated; // By contract, VNode objects may not be modified after passing them to maquette
  }
  let updated = false;
  if (vnode.vnodeSelector === '') {
    if (vnode.text !== previous.text) {
      let newVNode = document.createTextNode(vnode.text);
      domNode.parentNode.replaceChild(newVNode, domNode);
      vnode.domNode = newVNode;
      textUpdated = true;
      return textUpdated;
    }
  } else {
    if (vnode.vnodeSelector.lastIndexOf('svg', 0) === 0) { // lastIndexOf(needle,0)===0 means StartsWith
      projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
    }
    if (previous.text !== vnode.text) {
      updated = true;
      if (vnode.text === undefined) {
        domNode.removeChild(domNode.firstChild); // the only textnode presumably
      } else {
        domNode.textContent = vnode.text;
      }
    }
    updated = updateChildren(vnode, domNode, previous.children, vnode.children, projectionOptions) || updated;
    updated = updateProperties(domNode, previous.properties, vnode.properties, projectionOptions) || updated;
    if (vnode.properties && vnode.properties.afterUpdate) {
      vnode.properties.afterUpdate(<Element>domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children);
    }
  }
  if (updated && vnode.properties && vnode.properties.updateAnimation) {
    vnode.properties.updateAnimation(<Element>domNode, vnode.properties, previous.properties);
  }
  vnode.domNode = previous.domNode;
  return textUpdated;
};

let createProjection = function(vnode: VNode, projectionOptions: ProjectionOptions): Projection {
  return {
    update: function(updatedVnode: VNode) {
      if (vnode.vnodeSelector !== updatedVnode.vnodeSelector) {
        throw new Error('The selector for the root VNode may not be changed. (consider using dom.merge and add one extra level to the virtual DOM)');
      }
      updateDom(vnode, updatedVnode, projectionOptions);
      vnode = updatedVnode;
    },
    domNode: <Element>vnode.domNode
  };
};

// The following line is not possible in Typescript, hence the workaround in the two lines below
// export type VNodeChild = string|VNode|Array<VNodeChild>
/**
 * Only needed for the defintion of [[VNodeChild]].
 */
export interface VNodeChildren extends Array<VNodeChild> { };
/**
 * These are valid values for the children parameter of the [[h]] function.
 */
export type VNodeChild = string | VNode | VNodeChildren;

/**
 * The `h` method is used to create a virtual DOM node.
 * This function is largely inspired by the mercuryjs and mithril frameworks.
 * The `h` stands for (virtual) hyperscript.
 *
 * NOTE: There are {@link http://maquettejs.org/docs/rules.html|three basic rules} you should be aware of when updating the virtual DOM.
 *
 * @param selector    Contains the tagName, id and fixed css classnames in CSS selector format.
 *                    It is formatted as follows: `tagname.cssclass1.cssclass2#id`.
 * @param properties  An object literal containing properties that will be placed on the DOM node.
 * @param children    Virtual DOM nodes and strings to add as child nodes.
 *                    `children` may contain [[VNode]]s, `string`s, nested arrays, `null` and `undefined`.
 *                    Nested arrays are flattened, `null` and `undefined` are removed.
 *
 * @returns           A VNode object, used to render a real DOM later.
 */
/* istanbul ignore next: this function will be overwritten later, only its signature matters for documentation purposes */
export let h = function(selector: string, properties?: VNodeProperties, ...children: VNodeChild[]): VNode { return undefined; };

// Splitting the h into declaration and implementation because the Typescript compiler creates some surrogate code for desctructuring 'children'.
// This would needlessly slow the h() function down.
// This double declaration adds some extra bytes into the library, but it generates the right API documentation.
h = function(selector: string): VNode {
  let properties = arguments[1];
  if (typeof selector !== 'string') {
    throw new Error();
  }
  let childIndex = 1;
  if (properties && !properties.hasOwnProperty('vnodeSelector') && !Array.isArray(properties) && typeof properties === 'object') {
    childIndex = 2;
  } else {
    // Optional properties argument was omitted
    properties = undefined;
  }
  let text = undefined as string;
  let children = undefined as VNode[];
  let argsLength = arguments.length;
  // Recognize a common special case where there is only a single text node
  if (argsLength === childIndex + 1) {
    let onlyChild = arguments[childIndex];
    if (typeof onlyChild === 'string') {
      text = onlyChild;
    } else if (onlyChild !== undefined && onlyChild.length === 1 && typeof onlyChild[0] === 'string') {
      text = onlyChild[0];
    }
  }
  if (text === undefined) {
    children = [];
    for (; childIndex < arguments.length; childIndex++) {
      let child = arguments[childIndex];
      if (child === null || child === undefined) {
        continue;
      } else if (Array.isArray(child)) {
        appendChildren(selector, child, children);
      } else if (child.hasOwnProperty('vnodeSelector')) {
        children.push(child);
      } else {
        children.push(toTextVNode(child));
      }
    }
  }
  return {
    vnodeSelector: selector,
    properties: properties,
    children: children,
    text: text,
    domNode: null
  };
};

/**
 * Contains simple low-level utility functions to manipulate the real DOM.
 */
export let dom = {

  /**
   * Creates a real DOM tree from `vnode`. The [[Projection]] object returned will contain the resulting DOM Node in
   * its [[Projection.domNode|domNode]] property.
   * This is a low-level method. Users wil typically use a [[Projector]] instead.
   * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
   * objects may only be rendered once.
   * @param projectionOptions - Options to be used to create and update the projection.
   * @returns The [[Projection]] which also contains the DOM Node that was created.
   */
  create: function(vnode: VNode, projectionOptions?: ProjectionOptions): Projection {
    projectionOptions = applyDefaultProjectionOptions(projectionOptions);
    createDom(vnode, document.createElement('div'), undefined, projectionOptions);
    return createProjection(vnode, projectionOptions);
  },

  /**
   * Appends a new childnode to the DOM which is generated from a [[VNode]].
   * This is a low-level method. Users wil typically use a [[Projector]] instead.
   * @param parentNode - The parent node for the new childNode.
   * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
   * objects may only be rendered once.
   * @param projectionOptions - Options to be used to create and update the [[Projection]].
   * @returns The [[Projection]] that was created.
   */
  append: function(parentNode: Element, vnode: VNode, projectionOptions?: ProjectionOptions): Projection {
    projectionOptions = applyDefaultProjectionOptions(projectionOptions);
    createDom(vnode, parentNode, undefined, projectionOptions);
    return createProjection(vnode, projectionOptions);
  },

  /**
   * Inserts a new DOM node which is generated from a [[VNode]].
   * This is a low-level method. Users wil typically use a [[Projector]] instead.
   * @param beforeNode - The node that the DOM Node is inserted before.
   * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function.
   * NOTE: [[VNode]] objects may only be rendered once.
   * @param projectionOptions - Options to be used to create and update the projection, see [[createProjector]].
   * @returns The [[Projection]] that was created.
   */
  insertBefore: function(beforeNode: Element, vnode: VNode, projectionOptions?: ProjectionOptions): Projection {
    projectionOptions = applyDefaultProjectionOptions(projectionOptions);
    createDom(vnode, beforeNode.parentNode, beforeNode, projectionOptions);
    return createProjection(vnode, projectionOptions);
  },

  /**
   * Merges a new DOM node which is generated from a [[VNode]] with an existing DOM Node.
   * This means that the virtual DOM and the real DOM will have one overlapping element.
   * Therefore the selector for the root [[VNode]] will be ignored, but its properties and children will be applied to the Element provided.
   * This is a low-level method. Users wil typically use a [[Projector]] instead.
   * @param domNode - The existing element to adopt as the root of the new virtual DOM. Existing attributes and childnodes are preserved.
   * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]] objects
   * may only be rendered once.
   * @param projectionOptions - Options to be used to create and update the projection, see [[createProjector]].
   * @returns The [[Projection]] that was created.
   */
  merge: function(element: Element, vnode: VNode, projectionOptions?: ProjectionOptions): Projection {
    projectionOptions = applyDefaultProjectionOptions(projectionOptions);
    vnode.domNode = element;
    initPropertiesAndChildren(element, vnode, projectionOptions);
    return createProjection(vnode, projectionOptions);
  }

};

/**
 * A CalculationCache object remembers the previous outcome of a calculation along with the inputs.
 * On subsequent calls the previous outcome is returned if the inputs are identical.
 * This object can be used to bypass both rendering and diffing of a virtual DOM subtree.
 * Instances of CalculationCache can be created using [[createCache]].
 *
 * @param <Result> The type of the value that is cached.
 */
export interface CalculationCache<Result> {
  /**
   * Manually invalidates the cached outcome.
   */
  invalidate(): void;
  /**
   * If the inputs array matches the inputs array from the previous invocation, this method returns the result of the previous invocation.
   * Otherwise, the calculation function is invoked and its result is cached and returned.
   * Objects in the inputs array are compared using ===.
   * @param inputs - Array of objects that are to be compared using === with the inputs from the previous invocation.
   * These objects are assumed to be immutable primitive values.
   * @param calculation - Function that takes zero arguments and returns an object (A [[VNode]] assumably) that can be cached.
   */
  result(inputs: Object[], calculation: () => Result): Result;
}

/**
 * Creates a [[CalculationCache]] object, useful for caching [[VNode]] trees.
 * In practice, caching of [[VNode]] trees is not needed, because achieving 60 frames per second is almost never a problem.
 * For more information, see [[CalculationCache]].
 *
 * @param <Result> The type of the value that is cached.
 */
export let createCache = <Result>(): CalculationCache<Result> => {
  let cachedInputs = undefined as Object[];
  let cachedOutcome = undefined as Result;
  let result = {

    invalidate: function() {
      cachedOutcome = undefined;
      cachedInputs = undefined;
    },

    result: function(inputs: Object[], calculation: () => Result) {
      if (cachedInputs) {
        for (let i = 0; i < inputs.length; i++) {
          if (cachedInputs[i] !== inputs[i]) {
            cachedOutcome = undefined;
          }
        }
      }
      if (!cachedOutcome) {
        cachedOutcome = calculation();
        cachedInputs = inputs;
      }
      return cachedOutcome;
    }
  };
  return result;
};

/**
 * Keeps an array of result objects synchronized with an array of source objects.
 * See {@link http://maquettejs.org/docs/arrays.html|Working with arrays}.
 *
 * Mapping provides a [[map]] function that updates its [[results]].
 * The [[map]] function can be called multiple times and the results will get created, removed and updated accordingly.
 * A Mapping can be used to keep an array of components (objects with a `renderMaquette` method) synchronized with an array of data.
 * Instances of Mapping can be created using [[createMapping]].
 *
 * @param <Source>   The type of source elements. Usually the data type.
 * @param <Target>   The type of target elements. Usually the component type.
 */
export interface Mapping<Source, Target> {
  /**
   * The array of results. These results will be synchronized with the latest array of sources that were provided using [[map]].
   */
  results: Array<Target>;
  /**
   * Maps a new array of sources and updates [[results]].
   *
   * @param newSources   The new array of sources.
   */
  map(newSources: Array<Source>): void;
}

/**
 * Creates a {@link Mapping} instance that keeps an array of result objects synchronized with an array of source objects.
 * See {@link http://maquettejs.org/docs/arrays.html|Working with arrays}.
 *
 * @param <Source>       The type of source items. A database-record for instance.
 * @param <Target>       The type of target items. A [[Component]] for instance.
 * @param getSourceKey   `function(source)` that must return a key to identify each source object. The result must either be a string or a number.
 * @param createResult   `function(source, index)` that must create a new result object from a given source. This function is identical
 *                       to the `callback` argument in `Array.map(callback)`.
 * @param updateResult   `function(source, target, index)` that updates a result to an updated source.
 */
export let createMapping = <Source, Target>(
  getSourceKey: (source: Source) => (string | number),
  createResult: (source: Source, index: number) => Target,
  updateResult: (source: Source, target: Target, index: number) => void): Mapping<Source, Target> => {
  let keys = [] as Object[];
  let results = [] as Target[];

  return {
    results: results,
    map: function(newSources: Source[]) {
      let newKeys = newSources.map(getSourceKey);
      let oldTargets = results.slice();
      let oldIndex = 0;
      for (let i = 0; i < newSources.length; i++) {
        let source = newSources[i];
        let sourceKey = newKeys[i];
        if (sourceKey === keys[oldIndex]) {
          results[i] = oldTargets[oldIndex];
          updateResult(source, oldTargets[oldIndex], i);
          oldIndex++;
        } else {
          let found = false;
          for (let j = 1; j < keys.length; j++) {
            let searchIndex = (oldIndex + j) % keys.length;
            if (keys[searchIndex] === sourceKey) {
              results[i] = oldTargets[searchIndex];
              updateResult(newSources[i], oldTargets[searchIndex], i);
              oldIndex = searchIndex + 1;
              found = true;
              break;
            }
          }
          if (!found) {
            results[i] = createResult(source, i);
          }
        }
      }
      results.length = newSources.length;
      keys = newKeys;
    }
  };
};

/**
 * Creates a [[Projector]] instance using the provided projectionOptions.
 *
 * For more information, see [[Projector]].
 *
 * @param projectionOptions   Options that influence how the DOM is rendered and updated.
 */
export let createProjector = function(projectionOptions: ProjectionOptions): Projector {
  let projector: Projector;
  projectionOptions = applyDefaultProjectionOptions(projectionOptions);
  projectionOptions.eventHandlerInterceptor = function(propertyName: string, functionPropertyArgument: Function) {
    return function() {
      // intercept function calls (event handlers) to do a render afterwards.
      projector.scheduleRender();
      return functionPropertyArgument.apply(this, arguments);
    };
  };
  let renderCompleted = true;
  let scheduled: number;
  let stopped = false;
  let projections = [] as Projection[];
  let renderFunctions = [] as (() => VNode)[]; // matches the projections array

  let doRender = function() {
    scheduled = undefined;
    if (!renderCompleted) {
      return; // The last render threw an error, it should be logged in the browser console.
    }
    renderCompleted = false;
    for (let i = 0; i < projections.length; i++) {
      let updatedVnode = renderFunctions[i]();
      projections[i].update(updatedVnode);
    }
    renderCompleted = true;
  };

  projector = {
    scheduleRender: function() {
      if (!scheduled && !stopped) {
        scheduled = requestAnimationFrame(doRender);
      }
    },
    stop: function() {
      if (scheduled) {
        cancelAnimationFrame(scheduled);
        scheduled = undefined;
      }
      stopped = true;
    },

    resume: function() {
      stopped = false;
      renderCompleted = true;
      projector.scheduleRender();
    },

    append: function(parentNode, renderMaquetteFunction) {
      projections.push(dom.append(parentNode, renderMaquetteFunction(), projectionOptions));
      renderFunctions.push(renderMaquetteFunction);
    },

    insertBefore: function(beforeNode, renderMaquetteFunction) {
      projections.push(dom.insertBefore(beforeNode, renderMaquetteFunction(), projectionOptions));
      renderFunctions.push(renderMaquetteFunction);
    },

    merge: function(domNode, renderMaquetteFunction) {
      projections.push(dom.merge(domNode, renderMaquetteFunction(), projectionOptions));
      renderFunctions.push(renderMaquetteFunction);
    },

    replace: function(domNode, renderMaquetteFunction) {
      let vnode = renderMaquetteFunction();
      createDom(vnode, domNode.parentNode, domNode, projectionOptions);
      domNode.parentNode.removeChild(domNode);
      projections.push(createProjection(vnode, projectionOptions));
      renderFunctions.push(renderMaquetteFunction);
    }
  };
  return projector;
};

/**
 * A component is a pattern with which you can split up your web application into self-contained parts.
 *
 * A component may contain other components.
 * This can be achieved by calling the subcomponents `renderMaquette` functions during the [[renderMaquette]] function and by using the
 * resulting [[VNode]]s in the return value.
 *
 * This interface is not used anywhere in the maquette sourcecode, but this is a widely used pattern.
 */
export interface Component {
  /**
   * A function that returns the DOM representation of the component.
   */
  renderMaquette(): VNode;
}
