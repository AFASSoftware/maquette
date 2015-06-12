/* global maquette ace */
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
      func = new Function("maquette", "h", "projector", "domNode", script);
      error = "";
    } catch(e) {
      error = e.message;
    }
    if(func) {
      resultDomNode.innerHTML = "";
      try {
        func(maquette, maquette.h, maquette.createProjector(), resultDomNode);
      } catch(e) {
        error = "" + e;
      }
    }
    if(error) {
      resultDomNode.innerHTML = error;
    }
    projector.scheduleRender(); // (actually only for the 'error' css class on resultDomNode)
  };

  var createAce = function (textArea) {
    var content = textArea.textContent;
    var value = textArea.value;
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
    if (content && value.charCodeAt(0)===1) {
      // Happens sometimes in chrome while navigatiing back
      editor.setValue(content, 0);
      editor.clearSelection();
    }
  };

  var registerResultDomNode = function (domNode) {
    resultDomNode = domNode;
    validateScript();
  };

  var liveEditor = {
    renderEditor: function () {
      return h("textarea", { afterCreate: createAce });
    },
    renderResult: function () {
      return h("div.result", { afterCreate: registerResultDomNode, classes: { error: !!error } }); // Contents is supplied using resultDomNode
    }
  };

  return liveEditor;
}
