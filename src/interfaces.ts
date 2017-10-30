// The following line is not possible in Typescript, hence the workaround in the two lines below
// export type VNodeChild = string|VNode|Array<VNodeChild>

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
  afterCreate?(element: Element, projectionOptions: ProjectionOptions, vnodeSelector: string, properties: VNodeProperties, children: VNode[]): void;
  /**
   * Callback that is executed every time this node may have been updated. Child nodes and properties
   * have already been updated.
   * @param element - The element that may have been updated in the DOM.
   * @param projectionOptions - The projection options that were used, see [[createProjector]].
   * @param vnodeSelector - The selector passed to the [[h]] function.
   * @param properties - The properties passed to the [[h]] function.
   * @param children - The children for this node.
   */
  afterUpdate?(element: Element, projectionOptions: ProjectionOptions, vnodeSelector: string, properties: VNodeProperties, children: VNode[]): void;

  /**
   * Callback that is called when a node has been removed from the tree.
   * The callback is called during idle state or after a timeout (fallback).
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
  /* tslint:disable ban-types */
  /**
   * Used to uniquely identify a DOM node among siblings.
   * A key is required when there are more children with the same selector and these children are added or removed dynamically.
   * NOTE: this does not have to be a string or number, a [[MaquetteComponent]] Object for instance is also possible.
   */
  readonly key?: Object;
  /* tslint:enable ban-types */
  /**
   * An object literal like `{important:true}` which allows css classes, like `important` to be added and removed
   * dynamically.
   */
  readonly classes?: { [index: string]: boolean | null | undefined };
  /**
   * An object literal like `{height:'100px'}` which allows styles to be changed dynamically. All values must be strings.
   */
  readonly styles?: { [index: string]: string | null | undefined };

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
export type VNodeChild = string | VNode | VNodeChildren | null | undefined;

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
