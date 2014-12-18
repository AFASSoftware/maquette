API
=========

Domsetter
---------
The domsetter object is the main object. It is either bound to window.domsetter or it can be obtained using requirejs.

Domsetter.h
-----------
    function h(
      string selector, 
      [object properties], 
      [array children]
    )

The h method is used to create a virtual DOM node. This method is largely inspired by the mercuryjs and mithril frameworks.
The `selector` parameter contains the tagName, id and fixed css classnames in CSS selector format. 
It is formatted as follows: `tagname.cssclass1.cssclass2#id`. 
The properties parameter is an object literal that contains the properties to set on the DOM nodes. 
Additional conditional css classes can be provided using a `properties.classes` object with className properties with
boolean values. For example: `h('div', {classes: {class1: true, class2: false} }, [])`
The `children` parameter is an array of virtual DOM nodes to add as children. This array may contain nested arrays and null or undefined values.
Nested arrays are flattened and null and undefined values will be skipped.

In order for domsetter to be able to apply transitions and achieve high performance there are additional 
requirements to meet:

* All children should either have a unique selector, or have a unique `key` property in their properties object. 
* The `properties` object must always have the same keys in subsequent renderings. 
When properties are to be cleared, they must be set to null or undefined.
* The `properties.classes` object must always have the same keys in subsequent renderings.

Domsetter.createDom
-------------------
    function createDom(
      VNode vnode, 
      [object options]
    ) : Mount

The createDom method creates a real DOM given a VNode. It returns a Mount object. VNodes may only be mounted once.
this method returns a Mount object. The resulting DOM node will be present under mount.domNode.
This is a low-level method. Users wil typically use Domsetter.renderLoop instead.

Domsetter.mergeDom
------------------
    function mergeDom(
      Element element, 
      VNode vnode, 
      [object options]
    )

The mergeDom method created the real DOM from the VNode. The resulting

Mount
-----

The mount object represents a VNode tree that has been converted to a real DOM tree. It provides the following methods:

Mount.update
------------

    function update(
      VNode updatedVNode
    )

This function updates the mounted VNode to another VNode from a subsequent rendering.

Mount.domNode
-------------
    Node domNode

The Mount.domNode provides access to the DOM Node that has been rendered.

