/**
 * Exports here are NOT re-exported to maquette
 */
import { Projection, ProjectionOptions, VNode, VNodeProperties } from './interfaces';

/* tslint:disable no-http-string */
const NAMESPACE_W3 = 'http://www.w3.org/';
/* tslint:enable no-http-string */
const NAMESPACE_SVG = `${NAMESPACE_W3}2000/svg`;
const NAMESPACE_XLINK = `${NAMESPACE_W3}1999/xlink`;

let emptyArray = <VNode[]>[];

export let extend = <T>(base: T, overrides: any): T => {
  let result = {} as any;
  Object.keys(base).forEach((key) => {
    result[key] = (base as any)[key];
  });
  if (overrides) {
    Object.keys(overrides).forEach((key) => {
      result[key] = overrides[key];
    });
  }
  return result;
};

let same = (vnode1: VNode, vnode2: VNode) => {
  if (vnode1.vnodeSelector !== vnode2.vnodeSelector) {
    return false;
  }
  if (vnode1.properties && vnode2.properties) {
    if (vnode1.properties.key !== vnode2.properties.key) {
      return false;
    }
    return vnode1.properties.bind === vnode2.properties.bind;
  }
  return !vnode1.properties && !vnode2.properties;
};

let checkStyleValue = (styleValue: Object) => {
  if (typeof styleValue !== 'string') {
    throw new Error('Style values must be strings');
  }
};

let findIndexOfChild = (children: VNode[], sameAs: VNode, start: number) => {
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

let checkDistinguishable = (childNodes: VNode[], indexToCheck: number, parentVNode: VNode, operation: string) => {
  let childNode = childNodes[indexToCheck];
  if (childNode.vnodeSelector === '') {
    return; // Text nodes need not be distinguishable
  }
  let properties = childNode.properties;
  let key = properties ? (properties.key === undefined ? properties.bind : properties.key) : undefined;
  if (!key) { // A key is just assumed to be unique
    for (let i = 0; i < childNodes.length; i++) {
      if (i !== indexToCheck) {
        let node = childNodes[i];
        if (same(node, childNode)) {
          throw new Error(`${parentVNode.vnodeSelector} had a ${childNode.vnodeSelector} child ${
            operation === 'added' ? operation : 'removed'
            }, but there is now more than one. You must add unique key properties to make them distinguishable.`);
        }
      }
    }
  }
};

let nodeAdded = (vNode: VNode) => {
  if (vNode.properties) {
    let enterAnimation = vNode.properties.enterAnimation;
    if (enterAnimation) {
      enterAnimation(vNode.domNode as Element, vNode.properties);
    }
  }
};

let removedNodes: VNode[] = [];
let requestedIdleCallback = false;

let visitRemovedNode = (node: VNode) => {
  (node.children || []).forEach(visitRemovedNode);

  if (node.properties && node.properties.afterRemoved) {
    node.properties.afterRemoved.apply(
      node.properties.bind || node.properties,
      [<Element>node.domNode]
    );
  }
};

let processPendingNodeRemovals = (): void => {
  requestedIdleCallback = false;

  removedNodes.forEach(visitRemovedNode);
  removedNodes.length = 0;
};

let scheduleNodeRemoval = (vNode: VNode): void => {
  removedNodes.push(vNode);

  if (!requestedIdleCallback) {
    requestedIdleCallback = true;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(processPendingNodeRemovals, { timeout: 16 });
    } else {
      setTimeout(processPendingNodeRemovals, 16);
    }
  }
};

let nodeToRemove = (vNode: VNode) => {
  let domNode: Node = vNode.domNode!;
  if (vNode.properties) {
    let exitAnimation = vNode.properties.exitAnimation;
    if (exitAnimation) {
      (domNode as HTMLElement).style.pointerEvents = 'none';
      let removeDomNode = () => {
        if (domNode.parentNode) {
          domNode.parentNode.removeChild(domNode);
          scheduleNodeRemoval(vNode);
        }
      };
      exitAnimation(domNode as Element, removeDomNode, vNode.properties);
      return;
    }
  }
  if (domNode.parentNode) {
    domNode.parentNode.removeChild(domNode);
    scheduleNodeRemoval(vNode);
  }
};

let setProperties = (domNode: Node, properties: VNodeProperties | undefined, projectionOptions: ProjectionOptions) => {
  if (!properties) {
    return;
  }
  let eventHandlerInterceptor = projectionOptions.eventHandlerInterceptor;
  let propNames = Object.keys(properties);
  let propCount = propNames.length;
  for (let i = 0; i < propCount; i++) {
    let propName = propNames[i];
    let propValue = properties[propName];
    if (propName === 'className') {
      throw new Error('Property "className" is not supported, use "class".');
    } else if (propName === 'class') {
      (propValue as string).split(/\s+/).forEach(token => (domNode as Element).classList.add(token));
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
          projectionOptions.styleApplyer!(<HTMLElement>domNode, styleName, styleValue);
        }
      }
    } else if (propName !== 'key' && propValue !== null && propValue !== undefined) {
      let type = typeof propValue;
      if (type === 'function') {
        if (propName.lastIndexOf('on', 0) === 0) { // lastIndexOf(,0)===0 -> startsWith
          if (eventHandlerInterceptor) {
            propValue = eventHandlerInterceptor(propName, propValue, domNode, properties); // intercept eventhandlers
          }
          if (propName === 'oninput') {
            /* tslint:disable no-this-keyword no-invalid-this only-arrow-functions no-void-expression */
            (function() {
              // record the evt.target.value, because IE and Edge sometimes do a requestAnimationFrame between changing value and running oninput
              let oldPropValue = propValue;
              propValue = function(this: HTMLElement, evt: Event) {
                oldPropValue.apply(this, [evt]);
                (evt.target as any)['oninput-value'] = (evt.target as HTMLInputElement).value; // may be HTMLTextAreaElement as well
              };
            }());
            /* tslint:enable */
          }
          (domNode as any)[propName] = propValue;
        }
      } else if (projectionOptions.namespace === NAMESPACE_SVG) {
        if (propName === 'href') {
          (domNode as Element).setAttributeNS(NAMESPACE_XLINK, propName, propValue);
        } else {
          // all SVG attributes are read-only in DOM, so...
          (domNode as Element).setAttribute(propName, propValue);
        }
      } else if (type === 'string' && propName !== 'value' && propName !== 'innerHTML') {
        (domNode as Element).setAttribute(propName, propValue);
      } else {
        (domNode as any)[propName] = propValue;
      }
    }
  }
};

let addChildren = (domNode: Node, children: VNode[] | undefined, projectionOptions: ProjectionOptions) => {
  if (!children) {
    return;
  }
  for (let child of children) {
    createDom(child, domNode, undefined, projectionOptions);
  }
};

export let initPropertiesAndChildren = (domNode: Node, vnode: VNode, projectionOptions: ProjectionOptions) => {
  addChildren(domNode, vnode.children, projectionOptions); // children before properties, needed for value property of <select>.
  if (vnode.text) {
    domNode.textContent = vnode.text;
  }
  setProperties(domNode, vnode.properties, projectionOptions);
  if (vnode.properties && vnode.properties.afterCreate) {
    vnode.properties.afterCreate.apply(
      vnode.properties.bind || vnode.properties,
      [domNode as Element, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children]
    );
  }
};

export let createDom = (
  vnode: VNode,
  parentNode: Node,
  insertBefore: Node | null | undefined,
  projectionOptions: ProjectionOptions
): void => {
  let domNode: Node | undefined;
  let start = 0;
  let vnodeSelector = vnode.vnodeSelector;
  let doc = parentNode.ownerDocument;
  if (vnodeSelector === '') {
    domNode = vnode.domNode = doc.createTextNode(vnode.text!);
    if (insertBefore !== undefined) {
      parentNode.insertBefore(domNode, insertBefore);
    } else {
      parentNode.appendChild(domNode);
    }
  } else {
    for (let i = 0; i <= vnodeSelector.length; ++i) {
      let c = vnodeSelector.charAt(i);
      if (i === vnodeSelector.length || c === '.' || c === '#') {
        let type = vnodeSelector.charAt(start - 1);
        let found = vnodeSelector.slice(start, i);
        if (type === '.') {
          (domNode! as HTMLElement).classList.add(found);
        } else if (type === '#') {
          (domNode! as Element).id = found;
        } else {
          if (found === 'svg') {
            projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
          }
          if (projectionOptions.namespace !== undefined) {
            domNode = vnode.domNode = doc.createElementNS(projectionOptions.namespace, found);
          } else {
            domNode = vnode.domNode = (vnode.domNode || doc.createElement(found));
            if (found === 'input' && vnode.properties && vnode.properties.type !== undefined) {
              // IE8 and older don't support setting input type after the DOM Node has been added to the document
              (domNode as Element).setAttribute('type', vnode.properties.type);
            }
          }
          if (insertBefore !== undefined) {
            parentNode.insertBefore(domNode, insertBefore);
          } else if (domNode.parentNode !== parentNode) {
            parentNode.appendChild(domNode);
          }
        }
        start = i + 1;
      }
    }
    initPropertiesAndChildren(domNode!, vnode, projectionOptions);
  }
};

let updateDom: (previous: VNode, vnode: VNode, projectionOptions: ProjectionOptions) => boolean;

/**
 * Adds or removes classes from an Element
 * @param domNode the element
 * @param classes a string separated list of classes
 * @param on true means add classes, false means remove
 */
let toggleClasses = (domNode: HTMLElement, classes: string | null | undefined, on: boolean) => {
  if (!classes) {
    return;
  }
  classes.split(' ').forEach(c => domNode.classList.toggle(c, on));
};

let updateProperties = (
  domNode: Node, previousProperties: VNodeProperties | undefined,
  properties: VNodeProperties | undefined,
  projectionOptions: ProjectionOptions
) => {
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
    let previousValue = previousProperties![propName];
    if (propName === 'class') {
      if (previousValue !== propValue) {
        toggleClasses(domNode as HTMLElement, previousValue, false);
        toggleClasses(domNode as HTMLElement, propValue, true);
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
          projectionOptions.styleApplyer!(domNode as HTMLElement, styleName, newStyleValue);
        } else {
          projectionOptions.styleApplyer!(domNode as HTMLElement, styleName, '');
        }
      }
    } else {
      if (!propValue && typeof previousValue === 'string') {
        propValue = '';
      }
      if (propName === 'value') { // value can be manipulated by the user directly and using event.preventDefault() is not an option
        let domValue = (domNode as any)[propName];
        if (
          domValue !== propValue // The 'value' in the DOM tree !== newValue
          && ((domNode as any)['oninput-value']
            ? domValue === (domNode as any)['oninput-value'] // If the last reported value to 'oninput' does not match domValue, do nothing and wait for oninput
            : propValue !== previousValue // Only update the value if the vdom changed
          )
        ) {
          // The edge cases are described in the tests
          (domNode as any)[propName] = propValue; // Reset the value, even if the virtual DOM did not change
          (domNode as any)['oninput-value'] = undefined;
        } // else do not update the domNode, otherwise the cursor position would be changed
        if (propValue !== previousValue) {
          propertiesUpdated = true;
        }
      } else if (propValue !== previousValue) {
        let type = typeof propValue;
        if (type !== 'function' || !projectionOptions.eventHandlerInterceptor) { // Function updates are expected to be handled by the EventHandlerInterceptor
          if (projectionOptions.namespace === NAMESPACE_SVG) {
            if (propName === 'href') {
              (domNode as Element).setAttributeNS(NAMESPACE_XLINK, propName, propValue);
            } else {
              // all SVG attributes are read-only in DOM, so...
              (domNode as Element).setAttribute(propName, propValue);
            }
          } else if (type === 'string' && propName !== 'innerHTML') {
            if (propName === 'role' && propValue === '') {
              (domNode as any).removeAttribute(propName);
            } else {
              (domNode as Element).setAttribute(propName, propValue);
            }
          } else if ((domNode as any)[propName] !== propValue) { // Comparison is here for side-effects in Edge with scrollLeft and scrollTop
            (domNode as any)[propName] = propValue;
          }

          propertiesUpdated = true;
        }
      }
    }
  }
  return propertiesUpdated;
};

let updateChildren = (
  vnode: VNode,
  domNode: Node,
  oldChildren: VNode[] | undefined,
  newChildren: VNode[] | undefined,
  projectionOptions: ProjectionOptions
) => {
  if (oldChildren === newChildren) {
    return false;
  }
  oldChildren = oldChildren || emptyArray;
  newChildren = newChildren || emptyArray;
  let oldChildrenLength = oldChildren.length;
  let newChildrenLength = newChildren.length;

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
          nodeToRemove(oldChildren[i]);
          checkDistinguishable(oldChildren, i, vnode, 'removed');
        }
        textUpdated = updateDom(oldChildren[findOldIndex], newChild, projectionOptions) || textUpdated;
        oldIndex = findOldIndex + 1;
      } else {
        // New child
        createDom(newChild, domNode, (oldIndex < oldChildrenLength) ? oldChildren[oldIndex].domNode : undefined, projectionOptions);
        nodeAdded(newChild);
        checkDistinguishable(newChildren, newIndex, vnode, 'added');
      }
    }
    newIndex++;
  }
  if (oldChildrenLength > oldIndex) {
    // Remove child fragments
    for (i = oldIndex; i < oldChildrenLength; i++) {
      nodeToRemove(oldChildren[i]);
      checkDistinguishable(oldChildren, i, vnode, 'removed');
    }
  }
  return textUpdated;
};

updateDom = (previous, vnode, projectionOptions) => {
  let domNode = previous.domNode!;
  let textUpdated = false;
  if (previous === vnode) {
    return false; // By contract, VNode objects may not be modified anymore after passing them to maquette
  }
  let updated = false;
  if (vnode.vnodeSelector === '') {
    if (vnode.text !== previous.text) {
      let newTextNode = domNode.ownerDocument.createTextNode(vnode.text!);
      domNode.parentNode!.replaceChild(newTextNode, domNode);
      vnode.domNode = newTextNode;
      textUpdated = true;
      return textUpdated;
    }
    vnode.domNode = domNode;
  } else {
    if (vnode.vnodeSelector.lastIndexOf('svg', 0) === 0) { // lastIndexOf(needle,0)===0 means StartsWith
      projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
    }
    if (previous.text !== vnode.text) {
      updated = true;
      if (vnode.text === undefined) {
        domNode.removeChild(domNode.firstChild!); // the only textnode presumably
      } else {
        domNode.textContent = vnode.text;
      }
    }
    vnode.domNode = domNode;
    updated = updateChildren(vnode, domNode, previous.children, vnode.children, projectionOptions) || updated;
    updated = updateProperties(domNode, previous.properties, vnode.properties, projectionOptions) || updated;
    if (vnode.properties && vnode.properties.afterUpdate) {
      vnode.properties.afterUpdate.apply(
        vnode.properties.bind || vnode.properties,
        [<Element>domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children]
      );
    }
  }
  if (updated && vnode.properties && vnode.properties.updateAnimation) {
    vnode.properties.updateAnimation(<Element>domNode, vnode.properties, previous.properties);
  }
  return textUpdated;
};

export let createProjection = (vnode: VNode, projectionOptions: ProjectionOptions): Projection => {
  return {
    getLastRender: () => vnode,
    update: (updatedVnode: VNode) => {
      if (vnode.vnodeSelector !== updatedVnode.vnodeSelector) {
        throw new Error('The selector for the root VNode may not be changed. (consider using dom.merge and add one extra level to the virtual DOM)');
      }
      let previousVNode = vnode;
      vnode = updatedVnode;
      updateDom(previousVNode, updatedVnode, projectionOptions);
    },
    domNode: <Element>vnode.domNode
  };
};
