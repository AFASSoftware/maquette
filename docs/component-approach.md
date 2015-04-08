---
layout: default
title: Component approach
---
Maquette itself is not a framework. 
This means it does not force you to structure your application in a certain way.
Using components however is an obvious and convenient way to structure your application.
A component is simply an object instance with a `renderMaquette()` function.
This method can then be called a parent component in their `renderMaquette()` function,
thus forming a component hierarchy.

The code below shows this mechanism in its simplest form:

{% include live-editor-start.html %}var okButton = {
  renderMaquette: function () {
    return h("button", ["ok"])
  }
};

var form = {
  renderMaquette: function() {
    return h("div.form", [
      h("textarea"),
      okButton.renderMaquette()
    ]);
  }
};

maquette.createProjector(domNode, form.renderMaquette);
{% include live-editor-end.html %}

Let us go one step further. Let us create a function that creates button instances.

{% include live-editor-start.html %}var createButton = function(text, onClick) {
  var handleClick = function(evt) {
    evt.preventDefault();
    onClick();
  }

  return {
    renderMaquette: function() {
      return h("button", { onclick: handleClick }, [text])
    }
  };
};

var button = createButton("click me", function(){ alert("clicked"); });
maquette.createProjector(domNode, function(){ 
  return h("div", [
    button.renderMaquette()
  ]); 
});
{% include live-editor-end.html %}

You could also use the Javascript prototype way to create a Button class, but we prefer the
method above, because it is much simpeler and it provides real encapsulation.

There is one problem however with the implementation we have just shown. Consider the following snippet:

{% include live-editor-start.html %}var createButton = function(text, onClick) {
  return {
    renderMaquette: function() {
      return h("button", { onclick: onClick }, [text])
    }
  };
};

var lastStep = false;

var nextButton = createButton("Next", function() {
  lastStep = true;
});
var finishButton = createButton("Finish", function() {});

var renderMaquette = function() {
  return h("div.form", [
    h("textarea"),
    lastStep ? [
      finishButton.renderMaquette()
    ] : [
      nextButton.renderMaquette()
    ]
  ]);
};

maquette.createProjector(domNode, renderMaquette);
{% include live-editor-end.html %}
        
If the user presses the next button, the next button should disappear and the finish button should appear.
However, if you press the next button now the application event throws an error.
This is because maquette does not see one button disappearing and another button appearing, 
it sees a button changing its text and the onclick handler.
And changing an event handler is illegal in maquette, hence the error.

We want maquette to recognize that one button disappears and another button appears.
Not only to prevent the error, but also because it allows us to use animations.
In order to make maquette recognize that the button did not change but got replaced you need to 
provide a unique `key` property. The best value for the key property is probably the component instance itself.
In code below you see `myButton` used as a `key` for the component instance:

{% include live-editor-start.html %}var createMyButton = function(text, onClick) {
  var handleClick = function(evt) {
    evt.preventDefault();
    onClick();
  };

  var myButton = {
    renderMaquette: function() {
      return h("my-button", {key: myButton}, [ 
        h("button", { onclick: handleClick }, [text])
      ]);
    }
  };
  return myButton;
}

var button = createMyButton("click me", function(){ alert("clicked"); });
maquette.createProjector(domNode, function(){ 
  return h("div", [
    button.renderMaquette()
  ]); 
});

{% include live-editor-end.html %}

In this snippet we did something else as well. We added an extra wrapper element with a custom tagname.
This technique is also used by other frameworks, like polymer. This makes styling and debugging your components easier.
Browsers will just use an HTMLUnknown element which works just like a &lt;span&gt;. 
We really like this approach, but you can decide for yourself if you also want to use this.

{% include live-editor-init.html %}

