(function () {
  var h = maquette.h;

  var transformFunctions = ["rotate", "translateX", "translateY", "scaleX", "scaleY", "skewX", "skewY"];
  var nextKey = 0;

  window.createRemoteFunction = function (remote) {

    var key = nextKey ++;
    var transform = null;
    var value = 0;

    var getValueSuffix = function () {
      if(transform === "translateX" || transform === "translateY") {
        return "px";
      }
      if(transform === "scaleX" || transform === "scaleY") {
        return "";
      }
      return "deg";
    };

    // initializes transform and value
    for (var i = 0; !transform && i < transformFunctions.length; i++) {
      if (remote.isTransformAvailable(transformFunctions[i])) {
        transform = transformFunctions[i];
        if (getValueSuffix() === "") {
          value = 1; // scale 0 is not really a nice starting point
        }
      }
    }

    var handleTransformChange = function (evt) {
      transform = evt.target.value;
    };

    var handleValueInput = function (evt) {
      value = evt.target.value;
    };

    return {
      getTransform: function () {
        return transform;
      },
      getSaucerStyle: function () {
        return transform + "(" + value + getValueSuffix() + ")";
      },
      renderMaquette: function () {
        return h("div.function", { key: key }, [
          h("select", { value: transform, onchange: handleTransformChange }, [
            transformFunctions.map(function (transformFunction) {
              return h("option", { key: transformFunction, value: transformFunction }, [transformFunction]);
            })
          ]),
          h("input", { value: value, oninput: handleValueInput }),
          getValueSuffix()
        ]);
      }
    };
  };

}());