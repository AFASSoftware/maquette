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
    readonly vnodeSelector: string;
    /**
     * Object containing attributes, properties, event handlers and more, see [[h]].
     */
    readonly properties: VNodeProperties | undefined;
    /**
     * Array of [[VNode]]s to be used as children. This array is already flattened.
     */
    readonly children: Array<VNode> | undefined;
    /**
     * Used in a special case when a [[VNode]] only has one childnode which is a textnode. Only used in combination with children === undefined.
     */
    readonly text: string | undefined;
    /**
     * Used by maquette to store the domNode that was produced from this [[VNode]].
     */
    domNode: Node | null;
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
     * Synchronously re-renders to the DOM. You should normally call the `scheduleRender()` function to keep the
     * user interface more performant. There is however one good reason to call renderNow(),
     * when you want to put the focus into a newly created element in iOS.
     * This is only allowed when triggered by a user-event, not during requestAnimationFrame.
     */
    renderNow(): void;
    /**
     * Stops running the `renderMaquetteFunction` to update the DOM. The `renderMaquetteFunction` must have been
     * registered using [[append]], [[merge]], [[insertBefore]] or [[replace]].
     *
     * @returns The [[Projection]] which was created using this `renderMaquetteFunction`.
     * The [[Projection]] contains a reference to the DOM Node that was rendered.
     */
    detach(renderMaquetteFunction: () => VNode): Projection;
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
}
/**
 * Options that may be passed when creating the [[Projector]]
 */
export interface ProjectorOptions {
    /**
     * A transition strategy to invoke when enterAnimation and exitAnimation properties are provided as strings.
     * The module `cssTransitions` in the provided `css-transitions.js` file provides such a strategy.
     * A transition strategy is not needed when enterAnimation and exitAnimation properties are provided as functions.
     */
    readonly transitions?: TransitionStrategy;
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
/**
 * Options that influence how the DOM is rendered and updated.
 */
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
    eventHandlerInterceptor?: (propertyName: string, eventHandler: Function, domNode: Node, properties: VNodeProperties) => Function;
}
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
     */
    afterCreate?(element: Element, projectionOptions: ProjectionOptions, vnodeSelector: string, properties: VNodeProperties, children: VNode[]): void;
    /**
     * Callback that is executed every time this node may have been updated. Childnodes and properties
     * have already been updated.
     * @param element - The element that may have been updated in the DOM.
     * @param projectionOptions - The projection options that were used see [[createProjector]].
     * @param vnodeSelector - The selector passed to the [[h]] function.
     * @param properties - The properties passed to the [[h]] function.
     * @param children - The children for this node.
     */
    afterUpdate?(element: Element, projectionOptions: ProjectionOptions, vnodeSelector: string, properties: VNodeProperties, children: VNode[]): void;
    /**
     * When specified, the event handlers will be invoked with 'this' pointing to the value.
     * This is useful when using the prototype/class based implementation of Components.
     *
     * When no [[key]] is present, this object is also used to uniquely identify a DOM node.
     */
    readonly bind?: Object;
    /**
     * Used to uniquely identify a DOM node among siblings.
     * A key is required when there are more children with the same selector and these children are added or removed dynamically.
     * NOTE: this does not have to be a string or number, a [[Component]] Object for instance is also possible.
     */
    readonly key?: Object;
    /**
     * An object literal like `{important:true}` which allows css classes, like `important` to be added and removed
     * dynamically.
     */
    readonly classes?: {
        [index: string]: boolean | null | undefined;
    };
    /**
     * An object literal like `{height:'100px'}` which allows styles to be changed dynamically. All values must be strings.
     */
    readonly styles?: {
        [index: string]: string | null | undefined;
    };
    ontouchcancel?(ev?: TouchEvent): boolean | void;
    ontouchend?(ev?: TouchEvent): boolean | void;
    ontouchmove?(ev?: TouchEvent): boolean | void;
    ontouchstart?(ev?: TouchEvent): boolean | void;
    readonly action?: string;
    readonly encoding?: string;
    readonly enctype?: string;
    readonly method?: string;
    readonly name?: string;
    readonly target?: string;
    readonly href?: string;
    readonly rel?: string;
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
    onmousewheel?(ev?: WheelEvent | MouseWheelEvent): boolean | void;
    onscroll?(ev?: UIEvent): boolean | void;
    onsubmit?(ev?: Event): boolean | void;
    readonly spellcheck?: boolean;
    readonly tabIndex?: number;
    readonly disabled?: boolean;
    readonly title?: string;
    readonly accessKey?: string;
    readonly id?: string;
    readonly type?: string;
    readonly autocomplete?: string;
    readonly checked?: boolean;
    readonly placeholder?: string;
    readonly readOnly?: boolean;
    readonly src?: string;
    readonly value?: string;
    readonly alt?: string;
    readonly srcset?: string;
    /**
     * Puts a non-interactive piece of html inside the DOM node.
     *
     * Note: if you use innerHTML, maquette cannot protect you from XSS vulnerabilities and you must make sure that the innerHTML value is safe.
     */
    readonly innerHTML?: string;
    /**
     * Everything that is not explicitly listed (properties and attributes that are either uncommon or custom).
     */
    readonly [index: string]: any;
}
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
}
/**
 * Only needed for the definition of [[VNodeChild]].
 */
export interface VNodeChildren extends Array<VNodeChild> {
}
/**
 * These are valid values for the children parameter of the [[h]] function.
 */
export declare type VNodeChild = string | VNode | VNodeChildren | null | undefined;
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
    (selector: string, properties?: VNodeProperties, ...children: VNodeChild[]): VNode;
    (selector: string, ...children: VNodeChild[]): VNode;
}
/**
 * The `h` function is used to create a virtual DOM node.
 * This function is largely inspired by the mercuryjs and mithril frameworks.
 * The `h` stands for (virtual) hyperscript.
 *
 * All possible method signatures of this function can be found in the [[H]] 'interface'.
 *
 * NOTE: There are {@link http://maquettejs.org/docs/rules.html|three basic rules} you should be aware of when updating the virtual DOM.
 */
export declare let h: H;
/**
 * Contains simple low-level utility functions to manipulate the real DOM.
 */
export declare let dom: {
    create: (vnode: VNode, projectionOptions?: ProjectionOptions | undefined) => Projection;
    append: (parentNode: Element, vnode: VNode, projectionOptions?: ProjectionOptions | undefined) => Projection;
    insertBefore: (beforeNode: Element, vnode: VNode, projectionOptions?: ProjectionOptions | undefined) => Projection;
    merge: (element: Element, vnode: VNode, projectionOptions?: ProjectionOptions | undefined) => Projection;
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
     * @param calculation - Function that takes zero arguments and returns an object (A [[VNode]] presumably) that can be cached.
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
export declare let createCache: <Result>() => CalculationCache<Result>;
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
export declare let createMapping: <Source, Target>(getSourceKey: (source: Source) => string | number, createResult: (source: Source, index: number) => Target, updateResult: (source: Source, target: Target, index: number) => void) => Mapping<Source, Target>;
/**
 * Creates a [[Projector]] instance using the provided projectionOptions.
 *
 * For more information, see [[Projector]].
 *
 * @param projectorOptions   Options that influence how the DOM is rendered and updated.
 */
export declare let createProjector: (projectorOptions?: ProjectorOptions | undefined) => Projector;
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
    renderMaquette(): VNode | null | undefined;
}
