// Soon to be moved into maquette itself
window.maquetteEnhance = function (domNode, renderFunctionsByQuerySelector, projectionOptions) {
  var renderFunctions = [];
  var projections = [];

  var afterCreate = function (afterCreatedomNode, afterCreateProjectionOptions) {
    Object.keys(renderFunctionsByQuerySelector).forEach(function (querySelector) {
      var target = afterCreatedomNode.querySelector(querySelector);
      if(!target) {
        throw new Error("Could not find: " + querySelector);
      }
      var renderFunction = renderFunctionsByQuerySelector[querySelector];
      renderFunctions.push(renderFunction);
      projections.push(maquette.mergeDom(target, renderFunction(), afterCreateProjectionOptions));
    });
  };

  var afterUpdate = function () {
    for(var i = 0; i < renderFunctions.length; i++) {
      projections[i].update(renderFunctions[i]());
    }
  };

  var renderMaquette = function () {
    return maquette.h("body", { // body is actually just a placeholder, it will be ignored by maquette.mergeDom
      afterCreate: afterCreate,
      afterUpdate: afterUpdate
    });
  };

  return maquette.createProjector(domNode, renderMaquette, projectionOptions);
};


window.createLiveEditor = function (projector) { // projector can also be injected later

  var h = maquette.h;

  var editor;
  var validateTimeout;
  var error;
  var resultDomNode;

  var throttleValidateScript = function () {
    if(validateTimeout) {
      clearTimeout(validateTimeout);
    }
    validateTimeout = setTimeout(validateScript, 250);
  };

  // Super-fast way to validate the javascript
  var validateScript = function () {
    validateTimeout = null;
    var script = editor.getValue();
    var func;
    try {
      func = new Function("maquette", "h", "domNode", script);
      error = "";
    } catch(e) {
      error = e.message;
    }
    if(func) {
      resultDomNode.innerHTML = "";
      try {
        func(maquette, maquette.h, resultDomNode);
      } catch(e) {
        error = "" + e;
      }
    }
    if(error) {
      resultDomNode.innerHTML = error;
    }
    liveEditor.projector.scheduleRender(); // (actually only for the 'error' css class on resultDomNode)
  };

  var createAce = function (textArea) {
    editor = ace.edit(textArea);
    editor.setOptions({minLines: 5, maxLines: 50});
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode({ path: "ace/mode/javascript" });
    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);
    editor.setHighlightActiveLine(false);
    editor.setShowPrintMargin(false);
    editor.setBehavioursEnabled(true);
//    editor.renderer.setShowGutter(false);
    editor.getSession().on("change", throttleValidateScript);
  };

  var registerResultDomNode = function (domNode) {
    resultDomNode = domNode;
    validateScript();
  };

  var liveEditor = {
    projector: projector,
    renderEditor: function () {
      return h("textarea", { afterCreate: createAce });
    },
    renderResult: function () {
      return h("div.result", { afterCreate: registerResultDomNode, classes: { error: !!error } }); // Contents is supplied using resultDomNode
    },
    renderMaquette: function () {
      return h("live-editor", { key: liveEditor }, [
        liveEditor.renderEditor(),
        liveEditor.renderResult()
      ]);
    }
  };

  return liveEditor;
}
