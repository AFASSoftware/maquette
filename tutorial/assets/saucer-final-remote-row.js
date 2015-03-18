(function () {
  var h = maquette.h;

  var transformFunctionNames = ["rotate", "translateX", "translateY", "scaleX", "scaleY", "skewX", "skewY"];

  window.createRemoteRow = function (remote) {

    // State
    var transformFunctionName = null;
    var value = "";

    // initializes transformFunctionName to the first available value
    for(var i = 0; !transformFunctionName && i < transformFunctionNames.length; i++) {
      if(!remote.hasTransform(transformFunctionNames[i])) {
        transformFunctionName = transformFunctionNames[i];
      }
    }

    var getValueSuffix = function () {
      if(transformFunctionName === "translateX" || transformFunctionName === "translateY") {
        return "px";
      } else if(transformFunctionName === "scaleX" || transformFunctionName === "scaleY") {
        return "";
      } else {
        return "deg";
      }
    };

    // Event handlers
    var handleTransformChange = function (evt) {
      transformFunctionName = evt.target.value;
    };

    var handleValueInput = function (evt) {
      value = evt.target.value;
    };

    // The 'API' exposed by a 'remote row' component
    var remoteRow = {
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
      renderMaquette: function () {
        return h("div.row", { key: remoteRow }, [
          h("select", { value: transformFunctionName, onchange: handleTransformChange }, [
            transformFunctionNames
              .filter(function (name) { return name === transformFunctionName || !remote.hasTransform(name); }) // TODO
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

    return remoteRow;
  };

}());