Maquette works by rendering the desired representation of the DOM tree using a 
technique known as virtual hyperscript. 
Virtual Hyperscript is pure Javascript which executes very fast.
The following code shows an example of virtual hyperscript.

{% highlight text linenos=table %}
return h("p.input", [
  h("span", ["What is your name? "]),
  h("input", { type: "text", autofocus: true, value: name, oninput: nameInput })
]);
{% endhighlight %}

This code renders the same DOM in the browser as the static HTML snippet below (if the `name` variable is assigned an empty string).

{% highlight text linenos=table %}
<p class="input">
  <span>What is your name? </span>
  <input type="text" autofocus value="" oninput="nameInput"></input>
</p>
{% endhighlight %}


The following code demonstrates how easy it is to read user input and display it again.


{% highlight text linenos=table %}
var h = maquette.h;

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

// Starts the projector, which renders the virtual DOM and 
// updates the projection to the real DOM at the optimal moments
maquette.createProjector(document.body, render, {});
{% endhighlight %}

There is one rule when creating a virtual DOM nodes that requires special attention.
Maquette needs all childnodes to be distinguishable. This means that all children must either have a unique selector, or they must provide a unique `key` property.
Maquette needs ths information to do accurate animations. It also helps maquette to perform better.

More info can be found in the <a href="https://github.com/johan-gorter/maquette/blob/master/docs/API.md">API Reference</a>.
