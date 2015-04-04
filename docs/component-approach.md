Maquette itself is not a framework. 
This means it does not force you to structure your application in a certain way.
Using components is a very simple and convenient way to structure your application.
A component is simply an object instance with a renderMaquette() function.
This method can then be called a parent component in their renderMaquette() function,
thus forming a hierarchy.

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

Let's go one step further. Let's make function that creates a configurable button.

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

You could also use the Javascript prototype way to create a component class, but we like this
notation better because it is much simpeler and it provides real encapsulation. 
