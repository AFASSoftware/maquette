---
layout: default
title: Animations
---

The ability to use animations is one of the main features of maquette.
There are two main techniques that can you can use. CSS Transitions or programmatic.
We will first show how the programmatic approach works.

There

{% include live-editor-start.html %}var itemNrs = [1,2,3];
var lastItemNr = 3;

var slideDown = function(element) {
  Velocity.animate(element, "slideDown");
};

var add = function(evt) {
  itemNrs.push(++lastItemNr);
};

// Renders the virtual DOM
maquette.createProjector(domNode, function() {
  return h("body", [
    itemNrs.map(function(itemNr) {
      return h("div.item", {
        key:itemNr, "data-nr": ""+itemNr, 
        enterAnimation: slideDown
      }, [""+itemNr])
    }),
    h("button", {onclick: add}, ["+"])
  ]);
}, {});

{% include live-editor-end.html %}

{% include live-editor-init.html %}

