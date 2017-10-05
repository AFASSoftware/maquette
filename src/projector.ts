/**
 * A projector is used to create the real DOM from the the virtual DOM and to keep it up-to-date afterwards.
 *
 * You can call [[append]], [[merge]], [[insertBefore]] and [[replace]] to add the virtual DOM to the real DOM.
 * The `renderFunction` callbacks will be called to create the real DOM immediately.
 * Afterwards, the `renderFunction` callbacks will be called again to update the DOM on the next animation-frame after:
 *
 *  - The Projector's [[scheduleRender]] function  was called
 *  - An event handler (like `onclick`) on a rendered [[VNode]] was called.
 *
 * The projector stops when [[stop]] is called or when an error is thrown during rendering.
 * It is possible to use `window.onerror` to handle these errors.
 * Instances of [[Projector]] can be created using [[createProjector]].
 */
import { EventHandlerInterceptor, Projection, ProjectionOptions, ProjectorOptions, VNode, VNodeProperties } from './interfaces';
import { applyDefaultProjectionOptions, dom } from './dom';

export interface Projector {
  /**
   * Appends a new child node to the DOM using the result from the provided `renderFunction`.
   * The `renderFunction` will be invoked again to update the DOM when needed.
   * @param parentNode - The parent node for the new child node.
   * @param renderFunction - Function with zero arguments that returns a [[VNode]] tree.
   */
  append(parentNode: Element, renderFunction: () => VNode): void;
  /**
   * Inserts a new DOM node using the result from the provided `renderFunction`.
   * The `renderFunction` will be invoked again to update the DOM when needed.
   * @param beforeNode - The node that the DOM Node is inserted before.
   * @param renderFunction - Function with zero arguments that returns a [[VNode]] tree.
   */
  insertBefore(beforeNode: Element, renderFunction: () => VNode): void;
  /**
   * Merges a new DOM node using the result from the provided `renderFunction` with an existing DOM Node.
   * This means that the virtual DOM and real DOM have one overlapping element.
   * Therefore the selector for the root [[VNode]] will be ignored, but its properties and children will be applied to the Element provided
   * The `renderFunction` will be invoked again to update the DOM when needed.
   * @param domNode - The existing element to adopt as the root of the new virtual DOM. Existing attributes and child nodes are preserved.
   * @param renderFunction - Function with zero arguments that returns a [[VNode]] tree.
   */
  merge(domNode: Element, renderFunction: () => VNode): void;
  /**
   * Replaces an existing DOM node with the result from the provided `renderFunction`.
   * The `renderFunction` will be invoked again to update the DOM when needed.
   * @param domNode - The DOM node to replace.
   * @param renderFunction - Function with zero arguments that returns a [[VNode]] tree.
   */
  replace(domNode: Element, renderFunction: () => VNode): void;
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
   * Synchronously re-renders to the DOM. You should normally call the `scheduleRender()` function to keep the
   * user interface more performant. There is however one good reason to call renderNow(),
   * when you want to put the focus into a newly created element in iOS.
   * This is only allowed when triggered by a user-event, not during requestAnimationFrame.
   */
  renderNow(): void;
  /**
   * Stops running the `renderFunction` to update the DOM. The `renderFunction` must have been
   * registered using [[append]], [[merge]], [[insertBefore]] or [[replace]].
   *
   * @returns The [[Projection]] which was created using this `renderFunction`.
   * The [[Projection]] contains a reference to the DOM Node that was rendered.
   */
  detach(renderFunction: () => VNode): Projection;
  /**
   * Stops the projector. This means that the registered `renderMaquette` functions will not be called anymore.
   *
   * Note that calling [[stop]] is not mandatory. A projector is a passive object that will get garbage collected
   * as usual if it is no longer in scope.
   */
  stop(): void;
}

let createParentNodePath = (node: Node, rootNode: Element) => {
  let parentNodePath: Node[] = [];
  while (node !== rootNode) {
    parentNodePath.push(node);
    node = node.parentNode!;
  }
  return parentNodePath;
};

let findVNodeByParentNodePath = (vnode: VNode, parentNodePath: Node[]): VNode | undefined => {
  let result: VNode | undefined = vnode;
  parentNodePath.forEach(node => {
    result = (result && result.children) ? result.children!.find(child => child.domNode === node)! : undefined;
  });
  return result;
};

let createEventHandlerInterceptor = (projector: Projector, getProjection: () => Projection | undefined): EventHandlerInterceptor => {
  let modifiedEventHandler = function(this: Node, evt: Event) {
    let projection = getProjection()!;
    let parentNodePath = createParentNodePath(evt.currentTarget as Element, projection.domNode);
    parentNodePath.reverse();
    let matchingVNode = findVNodeByParentNodePath(projection.getLastRender(), parentNodePath);

    projector.scheduleRender();

    if (matchingVNode) {
      /* tslint:disable no-invalid-this */
      return matchingVNode.properties![`on${evt.type}`].apply(matchingVNode.properties!.bind || this, arguments);
      /* tslint:enable no-invalid-this */
    }
    return undefined;
  };
  return (propertyName: string, eventHandler: Function, domNode: Node, properties: VNodeProperties) => modifiedEventHandler;
};

/**
 * Creates a [[Projector]] instance using the provided projectionOptions.
 *
 * For more information, see [[Projector]].
 *
 * @param projectorOptions   Options that influence how the DOM is rendered and updated.
 */
export let createProjector = (projectorOptions?: ProjectorOptions): Projector => {
  let projector: Projector;
  let projectionOptions = applyDefaultProjectionOptions(projectorOptions);
  let renderCompleted = true;
  let scheduled: number | undefined;
  let stopped = false;
  let projections = [] as Projection[];
  let renderFunctions = [] as (() => VNode)[]; // matches the projections array

  let addProjection = (
    /* one of: dom.append, dom.insertBefore, dom.replace, dom.merge */
    domFunction: (node: Element, vnode: VNode, projectionOptions: ProjectionOptions) => Projection,
    /* the parameter of the domFunction */
    node: Element,
    renderFunction: () => VNode
  ): void => {
    let projection: Projection | undefined;
    let getProjection = () => projection;
    projectionOptions.eventHandlerInterceptor = createEventHandlerInterceptor(projector, getProjection);
    projection = domFunction(node, renderFunction(), projectionOptions);
    projections.push(projection);
    renderFunctions.push(renderFunction);
  };

  let doRender = () => {
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
    renderNow: doRender,
    scheduleRender: () => {
      if (!scheduled && !stopped) {
        scheduled = requestAnimationFrame(doRender);
      }
    },
    stop: () => {
      if (scheduled) {
        cancelAnimationFrame(scheduled);
        scheduled = undefined;
      }
      stopped = true;
    },

    resume: () => {
      stopped = false;
      renderCompleted = true;
      projector.scheduleRender();
    },

    append: (parentNode, renderFunction) => {
      addProjection(dom.append, parentNode, renderFunction);
    },

    insertBefore: (beforeNode, renderFunction) => {
      addProjection(dom.insertBefore, beforeNode, renderFunction);
    },

    merge: (domNode, renderFunction) => {
      addProjection(dom.merge, domNode, renderFunction);
    },

    replace: (domNode, renderFunction) => {
      addProjection(dom.replace, domNode, renderFunction);
    },

    detach: (renderFunction) => {
      for (let i = 0; i < renderFunctions.length; i++) {
        if (renderFunctions[i] === renderFunction) {
          renderFunctions.splice(i, 1);
          return projections.splice(i, 1)[0];
        }
      }
      throw new Error('renderFunction was not found');
    }

  };
  return projector;
};
