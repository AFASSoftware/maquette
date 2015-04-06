---
layout: default
title: Component approach
---
Maquette itself is not a framework. 
This means it does not force you to structure your application in a certain way.
Using components is an obvious and convenient way to structure your application.
A component is simply an object instance with a `renderMaquette()` function.
This method can then be called a parent component in their `renderMaquette()` function,
thus forming a hierarchy.

The code below shows this mechanism in its simplest form:

        var okButton = {
          renderMaquette: function () {
            return h("button", ["ok"])
          }
        }

        var form = {
          renderMaquette: function() {
            return h("div.form", [
              h("textarea"),
              okButton.renderMaquette()
            ])
          }
        }
        
        maquette.createProjector(domNode, form.renderMaquette);

Let us go one step further. Let us create a function that creates button instances.

        var createButton = function(text, onClick) {
          var handleClick = function(evt) {
            evt.preventDefault();
            onClick();
          }

          return {
            renderMaquette: function() {
              return h("button", { onclick: handleClick }, [text])
            }
          }
        }

        var button = createButton("click me", function(){alert("clicked");});
        maquette.createProjector(domNode, button.renderMaquette);

You could also use the Javascript prototype way to create a Button class, but we prefer the
method above, because it is much simpeler and it provides real encapsulation.

There is one problem however with the implementation we have just shown. Consider the following snippet:

        var lastButton = false;
        var nextButton = createButton("Next", function() {
          lastButton = true;
        });
        var finishButton = createButton("Finish", function() {});
        
        var renderMaquette = function() {
          return h("div.form", [
            h("textarea"),
            lastButton ? [
              nextButton.renderMaquette()
            ] : [
              finishButton.renderMaquette()
            ]
          ])
        }
        
If the user presses the next button, the next button should disappear and the finish button should appear.
However, if you press the next button now the application will throw an error.
This is because maquette does not see one button disappearing and another button appearing, 
it sees a button changing its text and the onclick handler.
And changing an event handler is illegal in maquette, hence the error.

We want maquette to recognize that one button disappears and another button appears.
Not only to prevent the error, but also because it allows us to use animations.
In order to make maquette recognize that the button did not change but got replaced you need to 
provide a unique `key` property. The best value for the key property is probably the component instance itself.
In code below you see `myButton` used as a `key` for the component instance:

        var createMyButton = function(text, onClick) {
          var handleClick = function(evt) {
            evt.preventDefault();
            onClick();
          }

          var myButton = {
            renderMaquette: function() {
              return h("my-button", {key: myButton}, [ 
                h("button", { onclick: handleClick }, [text])
              ]);
            }
          }
          return myButton;
        }

In this snippet we did something else as well. We added an extra wrapper element with a custom tagname.
This technique is also used by other frameworks, like polymer. This makes styling and debugging your components easier.
Browsers will just use an HTMLUnknown element which works just like a &lt;span&gt;. 
We really like this approach, but you can decide for yourself if you also want to use this.
