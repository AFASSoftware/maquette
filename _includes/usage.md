Maquette works by rendering the desired representation of the DOM tree using a 
technique known as virtual hyperscript. 
Virtual Hyperscript is pure Javascript which executes very fast.
The following code shows how.

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


The following code demonstrates how to read user input and display it again.


{% highlight text linenos=table %}
var name = "";

// Event handler for the 'input' event on the 'name' input
var nameInput = function (evt) {
  name = evt.target.value;
};

// Renders the virtual DOM
var render = function () {
return h("body", [
  h("p.input", [
    h("span", [
      "What is your name? "
    ]),
    h("input", { type: "text", autofocus: true, value: name, oninput: nameInput })
  ]),
  name ? h("p.output", [
    "Hello " + name + "!"
  ]) : null
]);
};

// Starts the renderLoop, which renders the virtual DOM at the right moments
maquette.renderLoop(document.body, render, {});
{% endhighlight %}

There is one special rule when creating a virtual DOM nodes, all childnodes must be distinguishable. This means
that all children must eather have a unique selector, or they should have a unique key.
This is needed to do accurate animations and it also helps maquette to perform better.
