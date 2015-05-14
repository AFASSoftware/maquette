---
layout: default
title: Animations
---

### Animations

The ability to use animations is one of the main features of maquette.
You can use the the following properties of a virtual DOM node to trigger animations:
`enterAnimation`, `exitAnimation` and `updateAnimation`.
There are two ways of doing animations: programmatically and using CSS Transitions.
We will first explain how to use programmatic animations and after that we
explain CSS Transitions.

##### Programmatic animations

Programmatic animations can be applied by assigning functions to the animation properties.
These functions have the following signatures:

 *enterAnimation*  | `function(domNode, properties)`
 *exitAnimation*   | `function(domNode, removeDomNodeFunction, properties)`
 *updateAnimation* | `function(domNode, properties, previousProperties)`

Inside these functions, you can do whatever you wish to animate the domNode.
You will usually use an animation library like [velocity.js](http://julian.com/research/velocity/) to start an animation.
With exit animations you need to make sure that you call the provided `removeDomNodeFunction` upon completion of the animation.

The following live example demonstrates programmatic animations using velocity.js.

{% include live-editor-start.html %}var itemNrs = [1,2,3];
var lastItemNr = 3;

// Animations
var itemEnter = function(domNode, properties) {
  var targetHeight = domNode.scrollHeight;
  domNode.style.height="0px";
  Velocity.animate(domNode, {height: targetHeight, opacity: [1,0]}, 400, "ease-out");
};
var itemExit = function(domNode, removeDomNodeFunction, properties) {
  Velocity.animate(domNode, {height: 0}, 400, "ease-out", removeDomNodeFunction);
};

// Event handlers
var add = function(evt) {
  itemNrs.push(++lastItemNr);
};
var remove = function(evt) {
  itemNrs.pop();
};

maquette.createProjector(domNode, function() {
  return h("body", [
    itemNrs.map(function(itemNr) {
      return h("div.demo-block-item", {
        key:itemNr, enterAnimation: itemEnter, exitAnimation: itemExit
      }, [itemNr.toString()]);
    }),
    h("button", {key: 0, onclick: add}, ["+"]),
    h("button", {key: 1, onclick: remove}, ["-"])
  ]);
}, {});{% include live-editor-end.html %}

##### CSS Transitions

Those of you who are familliar with AngularJS or React know that there is a technique to use CSS Transitions to animate
entering and exiting of DOM elements. You can use the same technique with maquette.

Note however that this technique is less versatile than programmatic transitions.
Both CSS Transitions and libraries like velocity.js are equally capable of delivering smooth sixty frames per second animations and using hardware accelleration.

A valid reason to use CSS Transitions instead of programmatic transitions could be if you do not want to include extra javascript.

The best way to explain this technique is through an example. Let us say an element with the enterAnimation `"slideUp"` is added, then the following happens:

 1. The CSS class `"slideUp"` is added to the element
 2. Immediately afterwards, the CSS class `"slideUp-active"` gets added. 
 3. The browser waits until a CSS transition finishes on the element
 4. Both CSS classes are removed again.

You can then use the following lines to the stylesheet to trigger the desired CSS Transition:

    .slideDown {
      -webkit-transition: 0.5s ease-out height;
      transition: 0.5s ease-out height;
      height: 0;
    }
    
    .slideDown.slideDown-active {
      height: 30px;
    }
    
CSS Transitions only work with maquette if you include the `css-transitions.js` script (provided by maquette) and you pass the option `transitions: cssTransitions` when creating the projector. 
The live example below demonstrates this.

{% include live-editor-start.html %}var itemNrs = [1,2,3];
var lastItemNr = 3;

// Event handlers
var add = function(evt) {
  itemNrs.push(++lastItemNr);
};
var remove = function(evt) {
  itemNrs.pop();
};

maquette.createProjector(domNode, function() {
  return h("body", [
    itemNrs.map(function(itemNr) {
      return h("div.demo-block-item", {
        key:itemNr, enterAnimation: "slideDown", exitAnimation: "slideUp"
      }, [itemNr.toString()]);
    }),
    h("button", {key: 0, onclick: add}, ["+"]),
    h("button", {key: 1, onclick: remove}, ["-"])
  ]);
}, {transitions: cssTransitions});{% include live-editor-end.html %}

{% include live-editor-init.html velocity=true css=true %}

If you want to see a demonstration of what more is possible with animations in maquette, have a look at the [hero-transition demo](http://johan-gorter.github.io/maquette-demo-hero/).