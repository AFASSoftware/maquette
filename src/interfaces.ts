export interface ProjectorService {
  /**
   * Instructs the projector to re-render to the DOM at the next animation-frame using the registered `render` functions.
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
}

export interface Projector extends ProjectorService {
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
   * Stops running the `renderFunction` to update the DOM. The `renderFunction` must have been
   * registered using [[append]], [[merge]], [[insertBefore]] or [[replace]].
   *
   * @returns The [[Projection]] which was created using this `renderFunction`.
   * The [[Projection]] contains a reference to the DOM Node that was rendered.
   */
  detach(renderFunction: () => VNode): Projection;
  /**
   * Stops the projector. This means that the registered `render` functions will not be called anymore.
   *
   * Note that calling [[stop]] is not mandatory. A projector is a passive object that will get garbage collected
   * as usual if it is no longer in scope.
   */
  stop(): void;
}

/**
 * A virtual representation of a DOM Node. Maquette assumes that [[VNode]] objects are never modified externally.
 * Instances of [[VNode]] can be created using [[h]].
 */
export interface VNode {
  /**
   * The CSS selector containing tagname, css classnames and id. An empty string is used to denote a text node.
   */
  readonly vnodeSelector: string;
  /**
   * Object containing attributes, properties, event handlers and more, see [[h]].
   */
  readonly properties: VNodeProperties | undefined;
  /**
   * Array of [[VNode]]s to be used as children. This array is already flattened.
   */
  readonly children: VNode[] | undefined;
  /**
   * Used in a special case when a [[VNode]] only has one child node which is a text node. Only used in combination with children === undefined.
   */
  readonly text: string | undefined;
  /**
   * Used by maquette to store the domNode that was produced from this [[VNode]].
   */
  domNode: Node | null;
}

/**
 * Object containing attributes, properties, event handlers and more that can be put on DOM nodes.
 *
 * For your convenience, all common attributes, properties and event handlers are listed here and are
 * type-checked when using Typescript.
 */
/* tslint:disable member-ordering - we order by Element type here */
export interface VNodeProperties {
  /**
   * The animation to perform when this node is added to an already existing parent.
   * {@link http://maquettejs.org/docs/animations.html|More about animations}.
   * @param element - Element that was just added to the DOM.
   * @param properties - The properties object that was supplied to the [[h]] method
   */
  enterAnimation?: ((element: Element, properties?: VNodeProperties) => void);
  /**
   * The animation to perform when this node is removed while its parent remains.
   * @param element - Element that ought to be removed from to the DOM.
   * @param removeElement - Function that removes the element from the DOM.
   * This argument is provided purely for convenience.
   * You may use this function to remove the element when the animation is done.
   * @param properties - The properties object that was supplied to the [[h]] method that rendered this [[VNode]] the previous time.
   */
  exitAnimation?(element: Element, removeElement: () => void, properties?: VNodeProperties): void;
  /**
   * The animation to perform when the properties of this node change.
   * This also includes attributes, styles, css classes. This callback is also invoked when node contains only text and that text changes.
   * {@link http://maquettejs.org/docs/animations.html|More about animations}.
   * @param element - Element that was modified in the DOM.
   * @param properties - The last properties object that was supplied to the [[h]] method
   * @param previousProperties - The previous properties object that was supplied to the [[h]] method
   */
  updateAnimation?(element: Element, properties?: VNodeProperties, previousProperties?: VNodeProperties): void;
  /**
   * Callback that is executed after this node is added to the DOM. Child nodes and properties have
   * already been applied.
   * @param element - The element that was added to the DOM.
   * @param projectionOptions - The projection options that were used, see [[createProjector]].
   * @param vnodeSelector - The selector passed to the [[h]] function.
   * @param properties - The properties passed to the [[h]] function.
   * @param children - The children that were created.
   */
  afterCreate?(
    element: Element,
    projectionOptions: ProjectionOptions,
    vnodeSelector: string,
    properties: VNodeProperties,
    children: VNode[] | undefined
  ): void;
  /**
   * Callback that is executed every time this node may have been updated. Child nodes and properties
   * have already been updated.
   * @param element - The element that may have been updated in the DOM.
   * @param projectionOptions - The projection options that were used, see [[createProjector]].
   * @param vnodeSelector - The selector passed to the [[h]] function.
   * @param properties - The properties passed to the [[h]] function.
   * @param children - The children for this node.
   */
  afterUpdate?(
    element: Element,
    projectionOptions: ProjectionOptions,
    vnodeSelector: string,
    properties: VNodeProperties,
    children: VNode[] | undefined
  ): void;

  /**
   * Callback that is called when a node has been removed from the tree.
   * The callback is called during idle state or after a timeout (fallback).
   * {@link https://maquettejs.org/docs/dom-node-removal.html|More info}
   * @param element - The element that has been removed from the DOM.
   */
  afterRemoved?(element: Element): void;
  /**
   * When specified, the event handlers will be invoked with 'this' pointing to the value.
   * This is useful when using the prototype/class based implementation of MaquetteComponents.
   *
   * When no [[key]] is present, this object is also used to uniquely identify a DOM node.
   */
  readonly bind?: object;
  /**
   * Used to uniquely identify a DOM node among siblings.
   * A key is required when there are more children with the same selector and these children are added or removed dynamically.
   * NOTE: this does not have to be a string or number, a [[MaquetteComponent]] Object for instance is also common.
   */
  readonly key?: Object;
  /**
   * An object literal like `{important:true}` which allows css classes, like `important` to be added and removed
   * dynamically.
   */
  readonly classes?: { [index: string]: boolean | null | undefined };
  /**
   * An object literal like `{height:'100px'}` which allows styles to be changed dynamically. All values must be strings.
   */
  readonly styles?: Partial<CSSStyleDeclaration>;

  // From Element
  ontouchcancel?(ev: TouchEvent): boolean | void;
  ontouchend?(ev: TouchEvent): boolean | void;
  ontouchmove?(ev: TouchEvent): boolean | void;
  ontouchstart?(ev: TouchEvent): boolean | void;
  // From HTMLFormElement
  readonly action?: string;
  readonly encoding?: string;
  readonly enctype?: string;
  readonly method?: string;
  readonly name?: string;
  readonly target?: string;
  // From HTMLAnchorElement
  readonly href?: string;
  readonly rel?: string;
  // From HTMLElement
  onblur?(ev: FocusEvent): boolean | void;
  onchange?(ev: Event): boolean | void;
  onclick?(ev: MouseEvent): boolean | void;
  ondblclick?(ev: MouseEvent): boolean | void;
  ondrag?(ev: DragEvent): boolean | void;
  ondragend?(ev: DragEvent): boolean | void;
  ondragenter?(ev: DragEvent): boolean | void;
  ondragleave?(ev: DragEvent): boolean | void;
  ondragover?(ev: DragEvent): boolean | void;
  ondragstart?(ev: DragEvent): boolean | void;
  ondrop?(ev: DragEvent): boolean | void;
  onfocus?(ev: FocusEvent): boolean | void;
  oninput?(ev: Event): boolean | void;
  onkeydown?(ev: KeyboardEvent): boolean | void;
  onkeypress?(ev: KeyboardEvent): boolean | void;
  onkeyup?(ev: KeyboardEvent): boolean | void;
  onload?(ev: Event): boolean | void;
  onmousedown?(ev: MouseEvent): boolean | void;
  onmouseenter?(ev: MouseEvent): boolean | void;
  onmouseleave?(ev: MouseEvent): boolean | void;
  onmousemove?(ev: MouseEvent): boolean | void;
  onmouseout?(ev: MouseEvent): boolean | void;
  onmouseover?(ev: MouseEvent): boolean | void;
  onmouseup?(ev: MouseEvent): boolean | void;
  onmousewheel?(ev: WheelEvent | MouseWheelEvent): boolean | void;
  onscroll?(ev: UIEvent): boolean | void;
  onsubmit?(ev: Event): boolean | void;
  readonly spellcheck?: boolean;
  readonly tabIndex?: number;
  readonly disabled?: boolean;
  readonly title?: string;
  readonly accessKey?: string;
  readonly class?: string;
  readonly id?: string;
  readonly draggable?: boolean;
  // From HTMLInputElement
  readonly type?: string;
  readonly autocomplete?: string;
  readonly checked?: boolean;
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly src?: string;
  readonly value?: string;
  // From HTMLImageElement
  readonly alt?: string;
  readonly srcset?: string;
  /**
   * Puts a non-interactive string of html inside the DOM node.
   *
   * Note: if you use innerHTML, maquette cannot protect you from XSS vulnerabilities and you must make sure that the innerHTML value is safe.
   */
  readonly innerHTML?: string;

  /**
   * Do not use className, use class instead
   */
  readonly className?: never | 'Hint: do not use `className`, use `class` instead';

  /**
   * Everything that is not explicitly listed (properties and attributes that are either uncommon or custom).
   */
  readonly [index: string]: any;
}
/* tslint:enable member-ordering */

/**
 * Only needed for the definition of [[VNodeChild]].
 */
export interface VNodeChildren extends Array<VNodeChild> { }
/**
 * These are valid values for the children parameter of the [[h]] function.
 */
export type VNodeChild = string | VNode | VNodeChildren | false | null | undefined;

/**
 * Represents a [[VNode]] tree that has been rendered to a real DOM tree.
 */
export interface Projection {
  /**
   * The DOM node that is used as the root of this [[Projection]].
   */
  readonly domNode: Element;
  /**
   * Updates the real DOM to match the new virtual DOM tree.
   * @param updatedVnode The updated virtual DOM tree. Note: The selector for the root of the [[VNode]] tree may not change.
   */
  update(updatedVnode: VNode): void;
  getLastRender(): VNode;
}

/**
 * Options that influence how the DOM is rendered and updated.
 */
export type EventHandlerInterceptor = (propertyName: string, eventHandler: Function, domNode: Node, properties: VNodeProperties) => Function | undefined;
export type PerformanceLoggerEvent = 'domEvent' | 'domEventProcessed' | 'renderStart' | 'rendered' | 'patched' | 'renderDone';
export type ProjectorPerformanceLogger = (eventType: PerformanceLoggerEvent, trigger: Event | undefined) => void;
/**
 * Options that may be passed when creating the [[Projector]]
 */
export interface ProjectorOptions {
  /**
   * Can be used to log performance metrics
   */
  performanceLogger?: ProjectorPerformanceLogger;

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
}

export interface ProjectionOptions extends ProjectorOptions {
  /**
   * Only for internal use. Used for rendering SVG Nodes.
   */
  readonly namespace?: string;
  /**
   * May be used to intercept registration of event-handlers.
   *
   * Used by the [[Projector]] to wrap eventHandler-calls to call [[scheduleRender]] as well.
   *
   * @param propertyName             The name of the property to be assigned, for example onclick
   * @param eventHandler             The function that was registered on the [[VNode]]
   * @param domNode                  The real DOM element
   * @param properties               The whole set of properties that was put on the VNode
   * @returns                        The function that is to be placed on the DOM node as the event handler, instead of `eventHandler`.
   */
  eventHandlerInterceptor?: EventHandlerInterceptor;
}

/**
 * Keeps an array of result objects synchronized with an array of source objects.
 * See {@link http://maquettejs.org/docs/arrays.html|Working with arrays}.
 *
 * Mapping provides a [[map]] function that updates its [[results]].
 * The [[map]] function can be called multiple times and the results will get created, removed and updated accordingly.
 * A Mapping can be used to keep an array of components (objects with a `render` method) synchronized with an array of data.
 * Instances of Mapping can be created using [[createMapping]].
 *
 * @param <Source>   The type of source elements. Usually the data type.
 * @param <Target>   The type of target elements. Usually the component type.
 */
export interface Mapping<Source, Target> {
  /**
   * The array of results. These results will be synchronized with the latest array of sources that were provided using [[map]].
   */
  results: Target[];
  /**
   * Maps a new array of sources and updates [[results]].
   *
   * @param newSources   The new array of sources.
   */
  map(newSources: Source[]): void;
}

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
   * @param calculation - Function that takes zero arguments and returns an object (A [[VNode]] presumably) that can be cached.
   */
  result(inputs: Object[], calculation: () => Result): Result;
}

/**
 * @deprecated Use [[MaquetteComponent]] instead.
 * @since 3.0
 */
export interface Component {
  renderMaquette(): VNode | null | undefined;
}

/**
 * A component is a pattern with which you can split up your web application into self-contained parts.
 *
 * A component may contain other components.
 * This can be achieved by calling the subcomponents `render` functions during the [[render]] function and by using the
 * resulting [[VNode]]s in the return value.
 *
 * This interface is not used anywhere in the maquette sourcecode, but this is a widely used pattern.
 */
export interface MaquetteComponent {
  /**
   * A function that returns the DOM representation of the component.
   */
  render(): VNode | null | undefined;
}

export interface Dom {
  /**
   * Creates a real DOM tree from `vnode`. The [[Projection]] object returned will contain the resulting DOM Node in
   * its [[Projection.domNode|domNode]] property.
   * This is a low-level method. Users will typically use a [[Projector]] instead.
   * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
   * objects may only be rendered once.
   * @param projectionOptions - Options to be used to create and update the projection.
   * @returns The [[Projection]] which also contains the DOM Node that was created.
   */
  create(vnode: VNode, projectionOptions?: ProjectionOptions): Projection;

  /**
   * Appends a new child node to the DOM which is generated from a [[VNode]].
   * This is a low-level method. Users will typically use a [[Projector]] instead.
   * @param parentNode - The parent node for the new child node.
   * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
   * objects may only be rendered once.
   * @param projectionOptions - Options to be used to create and update the [[Projection]].
   * @returns The [[Projection]] that was created.
   */
  append(parentNode: Element, vnode: VNode, projectionOptions?: ProjectionOptions): Projection;

  /**
   * Inserts a new DOM node which is generated from a [[VNode]].
   * This is a low-level method. Users wil typically use a [[Projector]] instead.
   * @param beforeNode - The node that the DOM Node is inserted before.
   * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function.
   * NOTE: [[VNode]] objects may only be rendered once.
   * @param projectionOptions - Options to be used to create and update the projection, see [[createProjector]].
   * @returns The [[Projection]] that was created.
   */
  insertBefore(beforeNode: Element, vnode: VNode, projectionOptions?: ProjectionOptions): Projection;

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
  merge(element: Element, vnode: VNode, projectionOptions?: ProjectionOptions): Projection;

  /**
   * Replaces an existing DOM node with a node generated from a [[VNode]].
   * This is a low-level method. Users will typically use a [[Projector]] instead.
   * @param element - The node for the [[VNode]] to replace.
   * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
   * objects may only be rendered once.
   * @param projectionOptions - Options to be used to create and update the [[Projection]].
   * @returns The [[Projection]] that was created.
   */
  replace(element: Element, vnode: VNode, projectionOptions?: ProjectionOptions): Projection;
}
