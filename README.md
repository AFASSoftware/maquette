Domdirector
=========

Domdirector is a Javascript library which makes it easy to synchronize the DOM tree in the browser with your data.
It uses a technique called 'Virtual DOM'. 
Compared to other virtual DOM implementations, domdirector has 3 advantages:

* It is very lightweight (2Kb gzipped)
* It allows changes to be animated
* It is optimized for speed

While domdirector is only focussed around the view of an application, we believe it is complete enough
to power a fully functional web application without needing yet another Javascript library.

Domdirector allows you to write a `render()` function that turns your data into a virtual representation 
of the DOM tree.
Domdirector will execute that function at convenient moments and adjust the DOM tree in the browser
accordingly.

The following code shows this mechanism in its most basic form:

```js
// Data
var name = "";

// Event handler for the 'input' event on the 'name' input
var nameInputHandler = function (evt) {
  name = evt.target.value;
};

// Renders the virtual DOM
var render = function () {
  return h("body", [
    h("p.input", [
      h("span", ["What is your name? "]),
      h("input", { type: "text", autofocus: true, value: name, oninput: nameInputHandler })
    ]),
    name ? h("p.output", ["Hello " + name + "!"]) : null
  ]);
};

// Starts the renderLoop, which renders the virtual DOM at the right moments
domdirector.renderLoop(document.body, render, {});
```
The h() function is used to create virtual DOM nodes using a technique known as 'virtual hyperscript'.

The renderLoop schedules the `render()` function to be executed on requestAnimationFrame when needed. 
The renderLoop automatically schedules a render when a registered eventhandler on the DOM is called.

## Speed

The first question that people usually ask when they are new to virtual DOM is, how well does it perform?
After all, rendering the whole represenation of the DOM and determining the difference with the 
previous render seems slow.
In my experience, rendering and diffing a large screen (say 5000 DOM nodes) is easily done within a single 
frame (16ms) on modern devices. May the speed become an issue, domdirector also has a powerful caching
mechanism which speeds up rendering and diffing significantly.

## Animated transitions

Domdirector allows adding and removing DOM nodes to be animated. 
It needs a transition plugin to do so. Right now the only available plugin uses VelocityJS.
A plugin which uses CSS Transitions will be developed soon. Follow the steps below to animate transitions:

* Add the velocity.js and velocityTransitions.js to the page (using script tags or requireJS)
* Add the `transitions: velocityTransitions` option to the renderLoop.
* Add enterAnimation and exitAnimation properties to the nodes that need to be animated.
The value for this property is the first argument for the velocity.animate function. 
You can use "slideDown" as enterAnimation and "slideUp" as exitAnimation for example.
* Enjoy!

More info can be found in the [API Reference](docs/API.md).