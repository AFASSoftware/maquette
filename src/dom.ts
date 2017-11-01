/**
 * Contains simple low-level utility functions to manipulate the real DOM.
 */
import { Projection, ProjectionOptions, VNode } from './interfaces';
import { createDom, createProjection, extend, initPropertiesAndChildren } from './projection';

const DEFAULT_PROJECTION_OPTIONS: ProjectionOptions = {
  namespace: undefined,
  performanceLogger: () => undefined,
  eventHandlerInterceptor: undefined,
  styleApplyer: (domNode: HTMLElement, styleName: string, value: string) => {
    // Provides a hook to add vendor prefixes for browsers that still need it.
    (domNode.style as any)[styleName] = value;
  }
};

export let applyDefaultProjectionOptions = (projectorOptions?: ProjectionOptions) => {
  return extend(DEFAULT_PROJECTION_OPTIONS, projectorOptions);
};

export let dom = {
  /**
   * Creates a real DOM tree from `vnode`. The [[Projection]] object returned will contain the resulting DOM Node in
   * its [[Projection.domNode|domNode]] property.
   * This is a low-level method. Users will typically use a [[Projector]] instead.
   * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
   * objects may only be rendered once.
   * @param projectionOptions - Options to be used to create and update the projection.
   * @returns The [[Projection]] which also contains the DOM Node that was created.
   */
  create: (vnode: VNode, projectionOptions?: ProjectionOptions): Projection => {
    projectionOptions = applyDefaultProjectionOptions(projectionOptions);
    createDom(vnode, document.createElement('div'), undefined, projectionOptions);
    return createProjection(vnode, projectionOptions);
  },

  /**
   * Appends a new child node to the DOM which is generated from a [[VNode]].
   * This is a low-level method. Users will typically use a [[Projector]] instead.
   * @param parentNode - The parent node for the new child node.
   * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
   * objects may only be rendered once.
   * @param projectionOptions - Options to be used to create and update the [[Projection]].
   * @returns The [[Projection]] that was created.
   */
  append: (parentNode: Element, vnode: VNode, projectionOptions?: ProjectionOptions): Projection => {
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
  insertBefore: (beforeNode: Element, vnode: VNode, projectionOptions?: ProjectionOptions): Projection => {
    projectionOptions = applyDefaultProjectionOptions(projectionOptions);
    createDom(vnode, beforeNode.parentNode!, beforeNode, projectionOptions);
    return createProjection(vnode, projectionOptions);
  },

  /**
   * Merges a new DOM node which is generated from a [[VNode]] with an existing DOM Node.
   * This means that the virtual DOM and the real DOM will have one overlapping element.
   * Therefore the selector for the root [[VNode]] will be ignored, but its properties and children will be applied to the Element provided.
   * This is a low-level method. Users wil typically use a [[Projector]] instead.
   * @param element - The existing element to adopt as the root of the new virtual DOM. Existing attributes and child nodes are preserved.
   * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]] objects
   * may only be rendered once.
   * @param projectionOptions - Options to be used to create and update the projection, see [[createProjector]].
   * @returns The [[Projection]] that was created.
   */
  merge: (element: Element, vnode: VNode, projectionOptions?: ProjectionOptions): Projection => {
    projectionOptions = applyDefaultProjectionOptions(projectionOptions);
    vnode.domNode = element;
    initPropertiesAndChildren(element, vnode, projectionOptions);
    return createProjection(vnode, projectionOptions);
  },

  /**
   * Replaces an existing DOM node with a node generated from a [[VNode]].
   * This is a low-level method. Users will typically use a [[Projector]] instead.
   * @param element - The node for the [[VNode]] to replace.
   * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
   * objects may only be rendered once.
   * @param projectionOptions - Options to be used to create and update the [[Projection]].
   * @returns The [[Projection]] that was created.
   */
  replace: (element: Element, vnode: VNode, projectionOptions?: ProjectionOptions): Projection => {
    projectionOptions = applyDefaultProjectionOptions(projectionOptions);
    createDom(vnode, element.parentNode!, element, projectionOptions);
    element.parentNode!.removeChild(element);
    return createProjection(vnode, projectionOptions);
  }
};
