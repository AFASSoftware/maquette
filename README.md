Domsetter
=========

Domsetter is a Javascript library which makes it easy to synchronize the DOM tree in the browser with your data.
It uses a technique called 'Virtual DOM'. 
Compared to other virtual DOM implementations, domsetter has 3 advantages:

* It is very lightweight 
* It is optimized for speed
* It allows changes to be animated

While domsetter is only focussed around the view of an application, we believe it is complete enough
to power a fully functional web application without needing yet another Javascript library.

Domsetter allows you to write a `render()` function that turns your data into a virtual representation 
of the DOM tree.
Domsetter will execute that function at convenient moments and synchronize the DOM tree in the browser
accordingly.

The following code shows this mechanism in action:

```js
// Data
var name = "";

// Event handler for the 'input' event on the 'name' input
var nameInput = function (evt) {
  name = evt.target.value;
};

// Renders the virtual DOM
var render = function () {
  return h("body", [
    h("p.input", [
      h("span", ["What is your name? "]),
      h("input", { type: "text", autofocus: true, value: name, oninput: nameInput })
    ]),
    name ? h("p.output", ["Hello " + name + "!"]) : null
  ]);
};

// Starts the renderLoop, which renders the virtual DOM at the right moments
domsetter.renderLoop(document.body, render, {});
```
The h() function is used to create virtual DOM nodes using a technique known as 'virtual hyperscript'.

The renderLoop schedules the `render()` function to be executed on requestAnimationFrame when needed. 
The renderLoop automatically schedules a render when a registered eventhandler on the DOM is called.
When the data changes due to a load or a timeout, you should call `renderLoop.scheduleRender()` manually.

## Speed

The first question that people usually ask when they are new to virtual DOM is, how well does it perform?
After all, rendering the whole DOM and determining the difference with the previous render seems slow.
In my experience, rendering and diffing a large screen (say 5000 DOM nodes) is done within a single 
frame (16ms) on modern devices. May the speed become an issue, domsetter also has a powerful caching
mechanism which speeds up rendering and diffing significantly.

## Animated transitions

Domsetter allows adding and removing DOM nodes to be animated. Right now this can be done using VelocityJS.
Support for CSS Transitions will also be possible in the future. These are the steps to follow:

* Add the velocity.js and velocityTransitions.js to the page (using script tags or requireJS)
* Add the `transitions: velocityTransitions` option to the renderLoop.
* Add enterAnimation and exitAnimation properties to the nodes that will be animated.
The value for this property is the first argument for velocity.animate. 
You can use "slideDown" as enterAnimation and "slideUp" as exitAnimation for example.
* Enjoy!    

More info can be found in the [API Reference](docs/API.md).