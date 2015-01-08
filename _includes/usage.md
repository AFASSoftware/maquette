Maquette works by rendering the desired representation of the DOM tree using a 
technique known as virtual hyperscript. 
Virtual Hyperscript (the `h()` function) is pure Javascript which executes very fast and has access
to variables.
The following code shows how.

{% highlight text linenos=table %}
return h("p.input", [
  h("span", ["What is your name? "]),
  h("input", { type: "text", autofocus: true, value: name, oninput: nameInput })
]);
{% endhighlight %}

This code represents the same DOM in the browser as the static HTML snippet below.

{% highlight text linenos=table %}
<p class="input">
  <span>What is your name? </span>
  <input type="text" autofocus value="" oninput="nameInput"></input>
</p>
{% endhighlight %}



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
