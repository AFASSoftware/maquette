Maquette makes it easy to keep your user interface synchronized with your data.
All you need to do is provide a `render()` function which creates the current state of your 
user interface from scratch.
This `render()` function returns a tree of virtual DOM nodes using the `h()` function. 
How the virtual DOM is translated to the real DOM is shown in the following 2 code snippets.
More details about the `h()` function can be found 
[in the API reference](https://github.com/johan-gorter/maquette/blob/master/docs/API.md#maquetteh). 

{% highlight text linenos=table %}
var h = maquette.h;
var name = "";

function render() {
  return h("p.input", [
    h("span", ["What is your name? "]),
    h("input", { type: "text", autofocus: true, value: name, oninput: nameInput })
  ]);
}
{% endhighlight %}

{% highlight text linenos=table %}
<p class="input">
  <span>What is your name? </span>
  <input type="text" autofocus value="" oninput="nameInput"></input>
</p>
{% endhighlight %}

The following code snippet shows how maquette uses a so called projector object which 
calls the `render()` function when needed. 
The projector always calls the render function asynchronously (using `requestAnimationFrame`). 
See the reference documentation for `projector()` for more details.

{% highlight text linenos=table %}
maquette.createProjector(document.body, render);
{% endhighlight %}

If you are curious about the remaining lines of code that will make the hello world application,
you can find it [here](https://github.com/johan-gorter/maquette/blob/master/examples/helloworld/index.html).

There is one rule when creating a virtual DOM nodes that requires special attention.
Maquette needs all childnodes of a virtual DOM node to be distinguishable. 
This means that they must either have a unique selector, or they must provide a unique `key` property.
Maquette needs this information to animate transitions. This also helps maquette to perform better.

More info can be found in the [API Reference](https://github.com/johan-gorter/maquette/blob/master/docs/API.md).
