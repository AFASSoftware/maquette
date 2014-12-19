API
===

## domsetter

The domsetter object is the main object. It is either bound to window.domsetter or it can be obtained using requirejs.

## domsetter.h

```js
function h(selector, properties, children) // returns VNode
```

The `h` method is used to create a virtual DOM node. 
This function is largely inspired by the mercuryjs and mithril frameworks.
The h stands for (virtual) hyperscript.
### parameters
1. `selector` *string*  
Contains the tagName, id and fixed css classnames in CSS selector format. 
It is formatted as follows: `tagname.cssclass1.cssclass2#id`. 
2. `properties` *object*  
An object literal containing properties that will be place on the DOM node.
This object may contain plain attributes like `href`, event handlers like `onclick`, 
a `key` to make nodes distinguishable and a `classes` object literal containing a className properties with boolean values.  
Example: `h('div', {classes: {class1: true, class2: false} }, [])`
3. `children` *Array of VNode*  
An array of virtual DOM nodes to add as child nodes. 
This array may contain nested arrays and null or undefined values.
Nested arrays are flattened and null and undefined values will be skipped.

In order for domsetter to be able to apply transitions and achieve high performance there are a few additional 
requirements to meet:

* All children should either have a unique selector, or have a unique `key` property. 
* The `properties` object must always contain the same set of properties in subsequent renderings. 
When properties are to be cleared, they must be set to either null or undefined.
* The `properties.classes` object must also always have the same properties in subsequent renderings.

## Domsetter.renderLoop

```js
function (element, renderFunction, options) // returns RenderLoop
```

TODO

## Domsetter.createCache

```js
function() // returns Cache
```

Creates a Cache object that is able to store a VNode and return it if the parameters remain the same.

## Domsetter.createDom

```js
function createDom(vnode, options) // returns Rendering 
```
The createDom method creates a real DOM tree given a VNode. The Rendering object returned will contain the 
resulting DOM Node under the Rendering.domNode property.
This is a low-level method. Users wil typically use Domsetter.renderLoop instead.
NOTE: VNode objects may only be rendered once.

## Domsetter.mergeDom

```js
function mergeDom(element, vnode, options) // returns Rendering
```

The createDom method creates a real DOM tree given a VNode at an already existing DOM element. 
The selector for the root VNode will be ignored, but its properties and children will be applied.
The Rendering object returned will contain the resulting DOM Node under the Rendering.domNode property.
This is a low-level method. Users wil typically use Domsetter.renderLoop instead.
NOTE: VNode objects may only be rendered once.

## Rendering

A Rendering object represents a VNode tree that has been converted to a real DOM tree. 
It provides the following properties:

## Rendering.update

```js
function update(updatedVNode)
```

This function updates the mounted VNode to another VNode from a subsequent rendering.

## Rendering.domNode

This property contains the root DOM Node that has been rendered.
