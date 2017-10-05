import { VNode, VNodeChild, VNodeProperties } from './interfaces';

let toTextVNode = (data: string): VNode => {
  return {
    vnodeSelector: '',
    properties: undefined,
    children: undefined,
    text: data.toString(),
    domNode: null
  };
};

let appendChildren = (parentSelector: string, insertions: VNodeChild[], main: VNode[]) => {
  for (let i = 0, length = insertions.length; i < length; i++) {
    let item = insertions[i];
    if (Array.isArray(item)) {
      appendChildren(parentSelector, item, main);
    } else {
      if (item !== null && item !== undefined) {
        if (typeof item === 'string') {
          item = toTextVNode(item);
        }
        main.push(item);
      }
    }
  }
};

/**
 * Contains all valid method signatures for the [[h]] function.
 */
export interface H {
  /**
   * @param selector    Contains the tagName, id and fixed css classnames in CSS selector format.
   *                    It is formatted as follows: `tagname.cssclass1.cssclass2#id`.
   * @param properties  An object literal containing properties that will be placed on the DOM node.
   * @param children    Virtual DOM nodes and strings to add as child nodes.
   *                    `children` may contain [[VNode]]s, `string`s, nested arrays, `null` and `undefined`.
   *                    Nested arrays are flattened, `null` and `undefined` are removed.
   *
   * @returns           A VNode object, used to render a real DOM later.
   */
  (selector: string, children: VNodeChild[]): VNode;
  (selector: string, properties?: VNodeProperties, children?: VNodeChild[]): VNode;
}

/**
 * The `h` function is used to create a virtual DOM node.
 * This function is largely inspired by the mercuryjs and mithril frameworks.
 * The `h` stands for (virtual) hyperscript.
 *
 * All possible method signatures of this function can be found in the [[H]] 'interface'.
 *
 * NOTE: There are {@link http://maquettejs.org/docs/rules.html|two basic rules} you should be aware of when updating the virtual DOM.
 */
export let h: H = (selector: string, properties?: VNodeProperties, children?: VNodeChild[]): VNode => {
  if (Array.isArray(properties)) {
    children = properties;
    properties = undefined;
  }
  let text: string | undefined;
  let flattenedChildren: VNode[] | undefined;
  // Recognize a common special case where there is only a single text node
  if (children !== undefined && children.length === 1 && typeof children[0] === 'string') {
    text = children[0] as string;
  } else if (children) {
    flattenedChildren = [];
    appendChildren(selector, children, flattenedChildren);
    if (flattenedChildren.length === 0) {
      flattenedChildren = undefined;
    }
  }
  return {
    vnodeSelector: selector,
    properties: properties,
    children: flattenedChildren,
    text: (text === '') ? undefined : text,
    domNode: null
  };
};
