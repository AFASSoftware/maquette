---
layout: default
title: Working with arrays
---

### Working with arrays

Working with arrays of data in maquette can simply  be accomplished by using the javascript `map` function,
mapping from the data to the virtual DOM nodes directly. This looks as follows:

{% include live-editor-start.html %}// The underlying data
var data = [1,2,3];

function renderMaquette() {
  return h("div", [
    // The javascript map function creates virtual DOM nodes from the data
    data.map(function(item, index) {
      return h("div.demo-block-item", [""+item]);
    })
  ]);
}

projector.append(domNode, renderMaquette);
{% include live-editor-end.html %}

It does get a little more complex if your items need to maintain state or event handlers. 
For performance reasons maquette forces you to reuse event handler functions on every render. So you need to keep track of them.
A good approach is to map the data to components and have these components render the virtual DOM.
The following example shows how to do this.

{% include live-editor-start.html %}// The underlying data
var data = [1,2,3];

// Create a component instance for every item in our data
var components = data.map(function(item) {
  var clickCount = 0;
  function handleClick(evt) {
    clickCount++;
  }
  return {
    renderMaquette: function() {
      return h("button.demo-block-item", {key: item, onclick: handleClick}, [
        "" + item + " (clicked " + clickCount + " times)"
      ]);
    }
  };
});

function renderMaquette() {
  return h("div", [
    // Render the components
    components.map(function(component) {
      return component.renderMaquette();
    })
  ]);
}

projector.append(domNode, renderMaquette);
{% include live-editor-end.html %}

There is one more advanced usecase. What if your items maintain state or event handlers but the underlying data can also get updated?
This could be the case if you use real-time communication or periodic refreshes. 
Maquette provides the `createMapping` function to keep your list of components synchronized with the underlying data.
The algorithm that maquette uses to update the array of components may look somewhat similar to how maquette updates the real DOM in order to reflect the virtual DOM, 
but there are subtle differences. For example, the components will be reordered, instead of being removed and recreated.

The `createMapping` function serves the same purpose as the Javascript `map` function, but with the ability
to call `map` multiple times and reusing the previous results where possible. The code below demonstrates this behavior. 

{% include live-editor-start.html %}// The underlying data
var dataSnapshot1 = [1, 3];
var dataSnapshot2 = [1, 2, 3];

var data = dataSnapshot1;

// Keeps the data and components synchronized. Components are stored under mapping.results
var mapping = maquette.createMapping(
  function getSourceKey(source) {
    // function that returns a key to uniquely identify each item in the data
    return source;
  },
  function createTarget(source) {
    // function to create the target based on the source (the same function that you use in Array.map)
    var clickCount = 0;
    function handleClick(evt) {
      clickCount++;
    }
    return {
      renderMaquette: function() {
        return h("button.demo-block-item", {key: source, onclick: handleClick}, [
          "" + source + " (clicked " + clickCount + " times)"
        ]);
      }
    };
  },
  function updateTarget(updatedSource, target) {
    // This function can be used to update the component with the updated item
  }
);
// Initialize the mapping
mapping.map(data);

function handleSwitch(evt) {
  data = (data === dataSnapshot1) ? dataSnapshot2 : dataSnapshot1;
  mapping.map(data);
}


function renderMaquette() {
  return h("div", [
    // Render the components
    mapping.results.map(function(component) {
      return component.renderMaquette();
    }),
    h("button", {onclick: handleSwitch}, ["Switch"])
  ]);
}

maquette.createProjector(domNode, renderMaquette);
{% include live-editor-end.html %}

More information about `createMapping` can be found in the [API]({{ site.api_url }}#.createMapping) documentation.

{% include live-editor-init.html %}

