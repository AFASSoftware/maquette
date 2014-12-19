Domsetter
=========

Domsetter is a javascript library which makes it easy to synchronize data with the DOM tree in the browser.
It uses a technique called 'Virtual DOM'. Compared to other virtual DOM implementations, domsetter is very
lightweight and it is able to apply animations when dom nodes are added, removed or updated.

The following code shows how domsetter works:

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

More info can be found in the [API Reference](API.md).