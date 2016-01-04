/**
 * A virtual representation of a DOM Node. Maquette assumes that {@link VNode} objects are never modified externally.
 * Instances of {@link VNode} can be created using {@link module:maquette.h}.
 */
export interface VNode {
    /**
     * The CSS selector containing tagname, css classnames and id. An empty string is used to denote a text node.
     */
    vnodeSelector: string;
    /**
     * Object containing attributes, properties, event handlers and more @see module:maquette.h
     */
    properties: VNodeProperties;
    /**
     * Array of VNodes to be used as children. This array is already flattened.
     */
    children: Array<VNode>;
    /**
     * Used in a special case when a VNode only has one childnode which is a textnode. Only used in combination with children === undefined.
     */
    text: string;
    /**
     * Used by maquette to store the domNode that was produced from this {@link VNode}.
     */
    domNode: Node;
}
/**
 * Used to create and update the DOM.
 * Use {@link Projector#append}, {@link Projector#merge}, {@link Projector#insertBefore} and {@link Projector#replace}
 * to create the DOM.
 * The `renderMaquetteFunction` callbacks will be called immediately to create the DOM. Afterwards, these functions
 * will be called again to update the DOM on the next animation-frame after:
 *
 *  - The {@link Projector#scheduleRender} function  was called
 *  - An event handler (like `onclick`) on a rendered {@link VNode} was called.
 *
 * The projector stops when {@link Projector#stop} is called or when an error is thrown during rendering.
 * It is possible to use `window.onerror` to handle these errors.
 * Instances of {@link Projector} can be created using {@link module:maquette.createProjector}.
 */
export interface Projector {
    /**
     * Appends a new childnode to the DOM using the result from the provided `renderMaquetteFunction`.
     * The `renderMaquetteFunction` will be invoked again to update the DOM when needed.
     * @param {Element} parentNode - The parent node for the new childNode.
     * @param {function} renderMaquetteFunction - Function with zero arguments that returns a {@link VNode} tree.
     */
    append(parentNode: Element, renderMaquetteFunction: () => VNode): void;
    /**
     * Inserts a new DOM node using the result from the provided `renderMaquetteFunction`.
     * The `renderMaquetteFunction` will be invoked again to update the DOM when needed.
     * @param {Element} beforeNode - The node that the DOM Node is inserted before.
     * @param {function} renderMaquetteFunction - Function with zero arguments that returns a {@link VNode} tree.
     */
    insertBefore(beforeNode: Element, renderMaquetteFunction: () => VNode): void;
    /**
     * Merges a new DOM node using the result from the provided `renderMaquetteFunction` with an existing DOM Node.
     * This means that the virtual DOM and real DOM have one overlapping element.
     * Therefore the selector for the root {VNode} will be ignored, but its properties and children will be applied to the Element provided
     * The `renderMaquetteFunction` will be invoked again to update the DOM when needed.
     * @param {Element} domNode - The existing element to adopt as the root of the new virtual DOM. Existing attributes and childnodes are preserved.
     * @param {function} renderMaquetteFunction - Function with zero arguments that returns a {@link VNode} tree.
     */
    merge(domNode: Element, renderMaquetteFunction: () => VNode): void;
    /**
     * Replaces an existing DOM node with the result from the provided `renderMaquetteFunction`.
     * The `renderMaquetteFunction` will be invoked again to update the DOM when needed.
     * @param {Element} domNode - The DOM node to replace.
     * @param {function} renderMaquetteFunction - Function with zero arguments that returns a {@link VNode} tree.
     */
    replace(domNode: Element, renderMaquetteFunction: () => VNode): void;
    /**
     * Resumes the projector. Use this method to resume rendering after stop was called or an error occurred during rendering.
     */
    resume(): void;
    /**
     * Instructs the projector to re-render to the DOM at the next animation-frame using the registered `renderMaquette` functions.
     * This method is automatically called for you when event-handlers that are registered in the {@link VNode}s are invoked.
     * You need to call this method for instance when timeouts expire or AJAX responses arrive.
     */
    scheduleRender(): void;
    /**
     * Stops the projector. This means that the registered `renderMaquette` functions will not be called anymore.
     * Note that calling {@link Projector#stop} is not mandatory. A projector is a passive object that will get garbage collected
     * as usual if it is no longer in scope.
     */
    stop(): void;
}
export interface Transitions {
    enter: (element: Element, properties: VNodeProperties, enterAnimation: string) => void;
    exit: (element: Element, properties: VNodeProperties, exitAnimation: string, removeElement: () => void) => void;
}
export interface ProjectionOptions {
    transitions?: Transitions;
    /**
     * Only for internal use.
     */
    namespace: string;
    eventHandlerInterceptor: Function;
    styleApplyer: (domNode: HTMLElement, styleName: string, value: string) => void;
}
export interface VNodeProperties {
    /**
     * The animation to perform when this node is added to an already existing parent.
     * When this value is a string, you must pass a `projectionOptions.transitions` object when creating the
     * projector {@link module:maquette.createProjector}.
     * {@link http://maquettejs.org/docs/animations.html|More about animations}.
     * @param {Element} element - Element that was just added to the DOM.
     * @param {Object} properties - The properties object that was supplied to the {@link module:maquette.h} method
     */
    enterAnimation?: ((element: Element, properties?: VNodeProperties) => void) | string;
    /**
     * The animation to perform when this node is removed while its parent remains.
     * When this value is a string, you must pass a `projectionOptions.transitions` object when creating the projector {@link module:maquette.createProjector}.
     * {@link http://maquettejs.org/docs/animations.html|More about animations}.
     * @param {Element} element - Element that ought to be removed from to the DOM.
     * @param {function(Element)} removeElement - Function that removes the element from the DOM.
     * This argument is supplied purely for convenience.
     * You may use this function to remove the element when the animation is done.
     * @param {Object} properties - The properties object that was supplied to the {@link module:maquette.h} method that rendered this {@link VNode}
     * the previous time.
     */
    exitAnimation?: ((element: Element, removeElement: () => void, properties?: VNodeProperties) => void) | string;
    /**
     * The animation to perform when the properties of this node change.
     * This also includes attributes, styles, css classes. This callback is also invoked when node contains only text and that text changes.
     * {@link http://maquettejs.org/docs/animations.html|More about animations}.
     * @param {Element} element - Element that was modified in the DOM.
     * @param {Object} properties - The last properties object that was supplied to the {@link module:maquette.h} method
     * @param {Object} previousProperties - The previous properties object that was supplied to the {@link module:maquette.h} method
     */
    updateAnimation?: (element: Element, properties?: VNodeProperties, previousProperties?: VNodeProperties) => void;
    /**
     * Callback that is executed after this node is added to the DOM. Childnodes and properties have
     * already been applied.
     * @param {Element} element - The element that was added to the DOM.
     * @param {Object} projectionOptions - The projection options that were used see {@link module:maquette.createProjector}.
     * @param {string} vnodeSelector - The selector passed to the {@link module:maquette.h} function.
     * @param {Object} properties - The properties passed to the {@link module:maquette.h} function.
     * @param {VNode[]} children - The children that were created.
     * @param {Object} properties - The last properties object that was supplied to the {@link module:maquette.h} method
     * @param {Object} previousProperties - The previous properties object that was supplied to the {@link module:maquette.h} method
     */
    afterCreate?: (element: Element, projectionOptions: ProjectionOptions, vnodeSelector: string, properties: VNodeProperties, children: VNode[]) => void;
    /**
     * Callback that is executed every time this node may have been updated. Childnodes and properties
     * have already been updated.
     * @param {Element} element - The element that may have been updated in the DOM.
     * @param {Object} projectionOptions - The projection options that were used see {@link module:maquette.createProjector}.
     * @param {string} vnodeSelector - The selector passed to the {@link module:maquette.h} function.
     * @param {Object} properties - The properties passed to the {@link module:maquette.h} function.
     * @param {VNode[]} children - The children for this node.
     */
    afterUpdate?: (element: Element, projectionOptions: ProjectionOptions, vnodeSelector: string, properties: VNodeProperties, children: VNode[]) => void;
    /**
     * Used to uniquely identify a DOM node among siblings.
     * A key is required when there are more children with the same selector and these children are added or removed dynamically.
     * NOTE: this does not have to be a string or number, a {@link Component} Object is also possible.
     */
    key?: Object;
    /**
     * An object literal like `{important:true}` which allows css classes, like `important` to be added and removed
     * dynamically.
     */
    classes?: {
        [index: string]: boolean;
    };
    /**
     * An object literal like `{height:'100px'}` which allows styles to be changed dynamically. All values must be strings.
     */
    styles?: {
        [index: string]: string;
    };
    ontouchcancel?: (ev?: TouchEvent) => boolean | void;
    ontouchend?: (ev?: TouchEvent) => boolean | void;
    ontouchmove?: (ev?: TouchEvent) => boolean | void;
    ontouchstart?: (ev?: TouchEvent) => boolean | void;
    action?: string;
    encoding?: string;
    enctype?: string;
    method?: string;
    name?: string;
    target?: string;
    onblur?: (ev?: FocusEvent) => boolean | void;
    onchange?: (ev?: Event) => boolean | void;
    onclick?: (ev?: MouseEvent) => boolean | void;
    ondblclick?: (ev?: MouseEvent) => boolean | void;
    onfocus?: (ev?: FocusEvent) => boolean | void;
    oninput?: (ev?: Event) => boolean | void;
    onkeydown?: (ev?: KeyboardEvent) => boolean | void;
    onkeypress?: (ev?: KeyboardEvent) => boolean | void;
    onkeyup?: (ev?: KeyboardEvent) => boolean | void;
    onload?: (ev?: Event) => boolean | void;
    onmousedown?: (ev?: MouseEvent) => boolean | void;
    onmouseenter?: (ev?: MouseEvent) => boolean | void;
    onmouseleave?: (ev?: MouseEvent) => boolean | void;
    onmousemove?: (ev?: MouseEvent) => boolean | void;
    onmouseout?: (ev?: MouseEvent) => boolean | void;
    onmouseover?: (ev?: MouseEvent) => boolean | void;
    onmouseup?: (ev?: MouseEvent) => boolean | void;
    onmousewheel?: (ev?: MouseWheelEvent) => boolean | void;
    onscroll?: (ev?: UIEvent) => boolean | void;
    onsubmit?: (ev?: Event) => boolean | void;
    spellcheck?: boolean;
    tabIndex?: number;
    title?: string;
    accessKey?: string;
    id?: string;
    autocomplete?: string;
    checked?: boolean;
    placeholder?: string;
    readOnly?: boolean;
    src?: string;
    value?: string;
    alt?: string;
    srcset?: string;
    /**
     * Everything else (properties and attributes that are either uncommon or custom)
     */
    [index: string]: any;
}
/**
 * Represents a {@link VNode} tree that has been rendered to a real DOM tree.
 */
export interface Projection {
    /**
     * The DOM node that is used as the root of this {@link Projection}.
     * @type {Element}
     */
    domNode: Element;
    /**
     * Updates the projection with the new virtual DOM tree.
     * @param {VNode} updatedVnode - The updated virtual DOM tree. Note: The selector for the root of the tree must remain constant.
     */
    update(updatedVnode: VNode): void;
}
/**
 * The following line is not possible in Typescript, hence the workaround in the two lines below
 * export type VNodeChild = string|VNode|Array<VNodeChild>
 */
export interface VNodeChildren extends Array<VNodeChild> {
}
/**
 * These are valid values for the children parameter of the h() function.
 */
export declare type VNodeChild = string | VNode | VNodeChildren;
/**
 * The `h` method is used to create a virtual DOM node.
 * This function is largely inspired by the mercuryjs and mithril frameworks.
 * The `h` stands for (virtual) hyperscript.
 *
 * @param {string} selector - Contains the tagName, id and fixed css classnames in CSS selector format.
 * It is formatted as follows: `tagname.cssclass1.cssclass2#id`.
 * @param {Object} [properties] - An object literal containing properties that will be placed on the DOM node.
 * @param {Object[]} [children] - An array of virtual DOM nodes to add as child nodes.
 * This array may contain nested arrays, `null` or `undefined` values.
 * Nested arrays are flattened, `null` and `undefined` will be skipped.
 *
 * @returns {VNode} A VNode object, used to render a real DOM later.
 * NOTE: There are {@link http://maquettejs.org/docs/rules.html|three basic rules} you should be aware of when updating the virtual DOM.
 */
export declare let h: (selector: string, properties?: VNodeProperties, ...children: VNodeChild[]) => VNode;
/**
 * The interface of the maquette.dom singleton
 */
export interface MaquetteDom {
    /**
     * Creates a real DOM tree from a {@link VNode}. The {@link Projection} object returned will contain the resulting DOM Node under
     * the {@link Projection#domNode} property.
     * This is a low-level method. Users wil typically use a {@link Projector} instead.
     * @param {VNode} vnode - The root of the virtual DOM tree that was created using the {@link module:maquette.h} function. NOTE: {@link VNode}
     * objects may only be rendered once.
     * @param {Object} projectionOptions - Options to be used to create and update the projection, see {@link module:maquette.createProjector}.
     * @returns {Projection} The {@link Projection} which contains the DOM Node that was created.
     */
    create: (vnode: VNode, projectionOptions: ProjectionOptions) => Projection;
    /**
     * Appends a new childnode to the DOM which is generated from a {@link VNode}.
     * This is a low-level method. Users wil typically use a {@link Projector} instead.
     * @param {Element} parentNode - The parent node for the new childNode.
     * @param {VNode} vnode - The root of the virtual DOM tree that was created using the {@link module:maquette.h} function. NOTE: {@link VNode}
     * objects may only be rendered once.
     * @param {Object} projectionOptions - Options to be used to create and update the projection, see {@link module:maquette.createProjector}.
     * @returns {Projection} The {@link Projection} that was created.
     */
    append: (parentNode: Element, vnode: VNode, projectionOptions: ProjectionOptions) => Projection;
    /**
     * Inserts a new DOM node which is generated from a {@link VNode}.
     * This is a low-level method. Users wil typically use a {@link Projector} instead.
     * @param {Element} beforeNode - The node that the DOM Node is inserted before.
     * @param {VNode} vnode - The root of the virtual DOM tree that was created using the {@link module:maquette.h} function.
     * NOTE: {@link VNode} objects may only be rendered once.
     * @param {Object} projectionOptions - Options to be used to create and update the projection, see {@link module:maquette.createProjector}.
     * @returns {Projection} The {@link Projection} that was created.
     */
    insertBefore: (beforeNode: Element, vnode: VNode, projectionOptions: ProjectionOptions) => Projection;
    /**
     * Merges a new DOM node which is generated from a {@link VNode} with an existing DOM Node.
     * This means that the virtual DOM and real DOM have one overlapping element.
     * Therefore the selector for the root {@link VNode} will be ignored, but its properties and children will be applied to the Element provided
     * This is a low-level method. Users wil typically use a {@link Projector} instead.
     * @param {Element} domNode - The existing element to adopt as the root of the new virtual DOM. Existing attributes and childnodes are preserved.
     * @param {VNode} vnode - The root of the virtual DOM tree that was created using the {@link module:maquette.h} function. NOTE: {@link VNode} objects
     * may only be rendered once.
     * @param {Object} projectionOptions - Options to be used to create and update the projection, see {@link module:maquette.createProjector}.
     * @returns {Projection} The {@link Projection} that was created.
     */
    merge: (element: Element, vnode: VNode, projectionOptions: ProjectionOptions) => Projection;
}
/**
 * Contains simple low-level utility functions to manipulate the real DOM. The singleton instance is available under {@link module:maquette.dom}.
 */
export declare let dom: MaquetteDom;
/**
 * A CalculationCache object remembers the previous outcome of a calculation along with the inputs.
 * On subsequent calls the previous outcome is returned if the inputs are identical.
 * This object can be used to bypass both rendering and diffing of a virtual DOM subtree.
 * Instances of CalculationCache can be created using {@link module:maquette.createCache}.
 */
export interface CalculationCache<Result> {
    /**
     * Manually invalidates the cached outcome.
     */
    invalidate: () => void;
    /**
     * If the inputs array matches the inputs array from the previous invocation, this method returns the result of the previous invocation.
     * Otherwise, the calculation function is invoked and its result is cached and returned.
     * Objects in the inputs array are compared using ===.
     * @param {Object[]} inputs - Array of objects that are to be compared using === with the inputs from the previous invocation.
     * These objects are assumed to be immutable primitive values.
     * @param {function} calculation - Function that takes zero arguments and returns an object (A {@link VNode} assumably) that can be cached.
     */
    result: (inputs: Object[], calculation: () => Result) => Result;
}
/**
 * Creates a {@link CalculationCache} object, useful for caching {@link VNode} trees.
 * In practice, caching of {@link VNode} trees is not needed, because achieving 60 frames per second is almost never a problem.
 * @returns {CalculationCache}
 */
export declare let createCache: <Result>() => CalculationCache<Result>;
/**
 * Keeps an array of result objects synchronized with an array of source objects.
 * Mapping provides a {@link Mapping#map} function that updates the {@link Mapping#results}.
 * The {@link Mapping#map} function can be called multiple times and the results will get created, removed and updated accordingly.
 * A {@link Mapping} can be used to keep an array of components (objects with a `renderMaquette` method) synchronized with an array of data.
 * Instances of {@link Mapping} can be created using {@link module:maquette.createMapping}.
 */
export interface Mapping<Source, Target> {
    /**
     * The array of results. These results will be synchronized with the latest array of sources that were provided using {@link Mapping#map}.
     * @type {Object[]}
     */
    results: Array<Target>;
    /**
     * Maps a new array of sources and updates {@link Mapping#results}.
     * @param {Object[]} newSources - The new array of sources.
     */
    map: (newSources: Array<Source>) => void;
}
/**
 * Creates a {@link Mapping} instance that keeps an array of result objects synchronized with an array of source objects.
 * @param {function} getSourceKey - `function(source)` that must return a key to identify each source object. The result must eather be a string or a number.
 * @param {function} createResult - `function(source, index)` that must create a new result object from a given source. This function is identical
 * argument of `Array.map`.
 * @param {function} updateResult - `function(source, target, index)` that updates a result to an updated source.
 * @returns {Mapping}
 */
export declare let createMapping: <Source, Target>(getSourceKey: (source: Source) => string | number, createResult: (source: Source, index: number) => Target, updateResult: (source: Source, target: Target, index: number) => void) => Mapping<Source, Target>;
/**
 * Creates a {@link Projector} instance using the provided projectionOptions.
 * @param {Object} [projectionOptions] - Options that influence how the DOM is rendered and updated.
 * @param {Object} projectionOptions.transitions - A transition strategy to invoke when
 * enterAnimation and exitAnimation properties are provided as strings.
 * The module `cssTransitions` in the provided `css-transitions.js` file provides such a strategy.
 * A transition strategy is not needed when enterAnimation and exitAnimation properties are provided as functions.
 * @returns {Projector}
 */
export declare let createProjector: (projectionOptions: ProjectionOptions) => Projector;
export interface Component {
    renderMaquette(): VNode;
}
