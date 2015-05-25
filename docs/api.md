---
layout: default
title: Maquette API
---

### maquette API

The main object in maquette is the `maquette` object. It is either bound to `window.maquette` or it can be obtained using browserify or requirejs.

#### maquette.h

```
function h(selector, properties, children) // returns a VNode object
```

The `h` method is used to create a virtual DOM node. 
This function is largely inspired by the mercuryjs and mithril frameworks.
The h stands for (virtual) hyperscript.

##### parameters

1. `selector` *string*  
Contains the tagName, id and fixed css classnames in CSS selector format. 
It is formatted as follows: `tagname.cssclass1.cssclass2#id`. 
2. `properties` *object*  
An object literal containing properties that will be placed on the DOM node. This includes:
 - **Event handlers** Functions like `onclick:handleClick` are registered as event handlers
 - **Attributes** All string values, like `href:"/"` are used as attributes
 - **Properties** All non-string values are put on the DOM node as properties
 - **key** Used to uniquely identify a DOM node among siblings. 
   A key is required when there are more children with the same `selector` and these children are added or removed dynamically.
 - **classes** An object literal like `{important:true}` which allows css classes, like `important` to be added and removed dynamically.
 - **styles** An object literal like `{height:"100px"}` which allows styles to be changed dynamically. Values must be strings.
3. `children` *Array of VNode objects and strings*  
An array of virtual DOM nodes to add as child nodes. Strings are used as text nodes. 
This array may even contain nested arrays, null or undefined.
Nested arrays are flattened, null and undefined will be skipped.

##### returns

A [VNode](#vnode) object, used to render a real DOM later.
 
NOTE: There are [three basic rules](rules.html) you should be aware of when rendering the virtual DOM.


#### Maquette.createProjector

```
function createProjector(element, renderFunction, options) // returns a Projector object
```

Starts a projector that executes the renderFunction and updates the DOM at the optimal moments. 
The renderFunction is always executed on requestAnimationFrame.
The renderFunction is scheduled to be executed on the first animation frame after:

* The projector was first started
* The [`projector.scheduleRender()`](#projectorchedulerender) function was called
* An event handler on a rendered virtual DOM node (onclick for example) was executed

##### parameters

* `element` *HTMLElement*  
  The DOM node where the virtual DOM is rendered. See [mergeDom](#maquettemergedom) for details on how this is done.
* `renderFunction` *function*  
  The render function that takes zero arguments and returns a VNode.
* `options` *object*  
 Options that influence how the DOM is rendered and updated.

##### returns

A [Projector](#projector) object containing a [`scheduleRender()`](#projectorschedulerender) method.

#### Maquette.createCache

```
function createCache() // returns a CalculationCache object
```

Creates a [CalculationCache](#calculationcache) object, useful for caching VNode trees. 
In practice, caching of VNode trees is not needed, because achieving 60 frames per second is almost never a problem.

##### returns

A [CalculationCache](#calculationcache) object.



#### Maquette.createDom

```
function createDom(vnode, options) // returns a Projection object
```
The createDom method creates a real DOM tree given a [VNode](#vnode). The [Projection](#projection) object returned 
will contain the resulting DOM Node under the [`Projection.domNode`](#projectiondomnode) property.
This is a low-level method. Users wil typically use [`Maquette.createProjector`](#maquettecreateprojector) instead.

NOTE: VNode objects may only be rendered once.

##### parameters

* `vnode` *VNode*  
  A virtual DOM tree that was created using the [`h()`](maquetteh) function.
* `options` *object*  
  Projection options

##### returns

A [Projection](#Projection) object.



#### Maquette.mergeDom

```
function mergeDom(element, vnode, options) // returns a Projection object
```

The mergeDom method creates a real DOM tree at an already existing DOM element given a [VNode](#vnode). 
This means that the virtual DOM and real DOM have one overlapping element.
The selector for the root VNode will be ignored, but its properties and children will be applied to the 
element provided.
This is a low-level method. Users wil typically use Maquette.createProjector instead.

NOTE: [VNode](#vnode) objects may only be rendered once.

##### parameters

* `element` *HTMLElement*  
  The element that is used as the root of the virtual DOM. It usually matches the selector of vnode, but this
  is not a hard requirement.
* `vnode` *VNode*  
  The root of the virtual DOM tree that was created using the [`h()`](#domsetterh) function.
* `options` *object*  
  Projection options

##### returns

A [Projection](#projection) object.

#### Maquette.createMapping

```
function createMapping(getSourceKey, createTarget, updateTarget)
```

Creates a mapping object that keeps an array of result objects synchronized with an array of source objects.
The resulting [mapping](#mapping) object contains a `map` method that updates the `mapping.results`.
This `map` function can be called multiple times and the results will get created and updated accordingly.
The `createMapping` method is useful for keeping an array of *components* (objects with a `renderMaquette` method) synchronized with an array of data.

##### parameters

* `getSourceKey` *function(source)*
  Function that returns a key to identify each source object. The result must be a string or a number.
* `createResult` *function(source, index)*
  Function that creates a new result object from a given source. This function is identical to the javascript `Array.map` argument.
* `updateResult` *function(source, target, index)*
  Function that updates a result to an updated source.
  
##### returns

A [Mapping](#mapping) object

#### Projector

A projector is an object that reschedules the rendering and projection of the virtual DOM at the optimal moment.
It has the following properties:

#### Projector.scheduleRender

```
function scheduleRender()
```

Signals the projector that a render needs to take place at the next animation frame.

#### Projector.destroy

```
function destroy()
```

Makes sure that no more renderings take place. Note that calling `destroy()` is not mandatory. 
A projector is a passive object that will get garbage collected as usual if it is no longer in scope.


#### Projection

A Projection object represents a VNode tree that has been rendered to a real DOM tree. 
It provides the following properties:

#### Projection.update

```
function update(updatedVNode)
```

This function updates the rendered VNode to another VNode from a subsequent rendering.

#### Projection.domNode

This property contains the root DOM Node that has been rendered.



#### CalculationCache

A CalculationCache object remembers the previous outcome of a calculation along with the inputs.
On subsequent calls the previous outcome is returned if the inputs are identical.
This object can be used to bypass rendering of a virtual DOM subtree to speed up rendering and diffing of 
the virtual DOM.

#### CalculationCache.result(inputs, calculation)

Returns the previous outcome of `CalculationCache.result` if the input array matches the previous input array.
Otherwise, the calculation function is executed and its result is cached and returned.
objects in the inputs array are compared using ===.

##### parameters

* `inputs` *array*  
  Inputs is an array of objects that are to be compared using === with the previous invocation. They are
  assumed to be immutable primitive values.
* `calculation` *function*  
  Calculation is a function that takes zero arguments and returns an object (A VNode assumably) that can be cached.

#### CalculationCache.invalidate()

Manually invalidates the cached outcome.



#### Mapping

An object that keeps an array of result object synchronized with an array of source objects.

#### Mapping.map

```
function(sources)
```
Maps a new array of sources.

##### parameters

* `sources` *array*
  The new sources to map.

#### Mapping.results

The array of results. These results will be the result of mapping the latest sources.






#### VNode

A virtual representation of a DOM Node. Maquette assumes that VNode objects are never modified externally.