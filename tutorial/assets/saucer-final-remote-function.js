(function () {
  var h = maquette.h;

  var transformFunctionNames = ["rotate", "translateX", "translateY", "scaleX", "scaleY", "skewX", "skewY"];
  var nextKey = 0;

  window.createRemoteFunction = function (remote) {

    var key = nextKey++;
    var transformFunctionName = null;
    var value = "";

    var getValueSuffix = function () {
      if(transformFunctionName === "translateX" || transformFunctionName === "translateY") {
        return "px";
      }
      if(transformFunctionName === "scaleX" || transformFunctionName === "scaleY") {
        return "";
      }
      return "deg";
    };

    // initialize transform to the first available value
    for(var i = 0; !transformFunctionName && i < transformFunctionNames.length; i++) {
      if(remote.isTransformAvailable(transformFunctionNames[i])) {
        transformFunctionName = transformFunctionNames[i];
      }
    }

    var handleTransformChange = function (evt) {
      transformFunctionName = evt.target.value;
    };

    var handleValueInput = function (evt) {
      value = evt.target.value;
    };

    return {
      getTransform: function () {
        return transformFunctionName;
      },
      getSaucerStyle: function () {
        if(value) {
          return transformFunctionName + "(" + value + getValueSuffix() + ")";
        } else {
          return "";
        }
      },
      getValue: function () {
        return value;
      },
      renderMaquette: function () {
        return h("div.function", { key: key }, [
          h("select", { value: transformFunctionName, onchange: handleTransformChange }, [
            transformFunctionNames
              .map(function (name) {
                return h("option", { key: name, value: name }, [
                  name
                ]);
              })
          ]),
          h("input", { value: value, oninput: handleValueInput }),
          getValueSuffix()
        ]);
      }
    };
  };

}());