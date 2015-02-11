window.createWorkbench = function (projector, script) {

  // constants
  var h = maquette.h;
  var htmlStart = "<!doctype html><html><head><link href='assets/saucer.css' rel='stylesheet' /><script src='bower_components/maquette/dist/maquette.min.js'><" + "/script><script>";
  var htmlEnd = "<" + "/script></head><body></body></html>";

  var lastValidScript = script;
  var validateTimeout;
  var parseError = null;
  var editor;
  var changeDelay;

  var lastScrdoc = null;
  var lastMarkup = "";

  var iframeBodyObserver = new MutationObserver(function (mutations) {
    console.log("MutationObserver " + mutations.length + ": " + contentWindow.document.body.innerHTML);
  });

  var testIndex = 1;
  var iframeLoaded = function (evt) {
    console.log("IFrame onload fired " + evt.target.contentWindow.document.body.innerHTML);
    contentWindow = evt.target.contentWindow;
    iframeBodyObserver.disconnect();
    iframeBodyObserver.observe(evt.target.contentWindow.document.body, { childList: true, attributes: true, characterData: true, subtree: true });
  };

  var contentWindow;

  var hookIframe = function (iframe, projectionOptions, selector, properties, children) {
    if (properties.srcdoc !== lastScrdoc) {
      lastMarkup = "";
      if(!("srcdoc" in document.createElement("iframe"))) {
        // Polyfill for browsers who do not support the HTML5 srcdoc
        var jsUrl = "javascript: window.frameElement.getAttribute('srcdoc');";
        iframe.setAttribute("src", jsUrl);
        if (iframe.contentWindow) {
          iframe.contentWindow.document.body.innerHTML = "";
          iframe.contentWindow.location = jsUrl;
        }
      }
      contentWindow = iframe.contentWindow;
      if(!contentWindow.testIndex) {
        contentWindow.testIndex = testIndex++;
      }
      console.log("New content window " + contentWindow.testIndex);
      if (!iframe.testIndex) {
        iframe.testIndex = testIndex++;
      }
      console.log("IFrame " + iframe.testIndex);
      if (!pollTimeout) {
        pollTimeout = setTimeout(poll);
      }
      lastScrdoc = properties.srcdoc;
    }
  };

  var pollTimeout;
  var poll = function () {
    pollTimeout = undefined;
    if (contentWindow.maquette && contentWindow.maquette.stats.lastProjector) {
      var markup = contentWindow.document.body.innerHTML;
      if(markup !== lastMarkup) {
        lastMarkup = markup;
        projector.scheduleRender();
        if(markup.length > 0) {
          return; //stop polling for now
        }
      };
    };
    pollTimeout = setTimeout(poll, 100);
  };

  var validateScript = function () {
    validateTimeout = null;
    try {
      var test = new Function(script);
      lastValidScript = script;
      parseError = null;
    } catch (e) {
      parseError = e.message;
    };
    projector.scheduleRender();
  };

  var verify = function () {
    // is called after JSLint has parsed the code
    changeDelay = undefined;
    var session = editor.getSession();
    var markers = session.getAnnotations();
    var markerCount = markers.length;
    if (markerCount === 0) {
      lastValidScript = session.getValue();
      parseError = null;
    } else {
      parseError = "" + markerCount + " errors";
    }
    projector.scheduleRender();
  };

  var createEditor = function (div) {
    editor = ace.edit(div);
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
    editor.setBehavioursEnabled(true);
    editor.setValue(script, 0);
    editor.focus();
    editor.clearSelection();

    editor.getSession().on("changeAnnotation", verify);
  };

  var getMarkup = function () {
    return lastMarkup;
  };

  var workbench = {
    renderMaquette: function () {
      var html = htmlStart + lastValidScript + htmlEnd;

      return h("div.work", [
        h("div.input", [
          h("div.tab", ["saucer.js"]),
          h("div.editor", { afterCreate: createEditor }),
          h("div.parseError", [parseError])
        ]),
        h("div.result", [
          h("div.objectives", [
            h("section.objective", { key: 1 }, [
              h("header", [
                h("span", ["Objective 1: Update the DOM to match", null])
              ]),
              h("div.detail", [
                h("p", ["Make sure the DOM matches the following markup"]),
                markupMatcher.renderMaquette()
              ])
            ])
          ]),
          h("div.preview", [
            h("iframe", { srcdoc: html, onload: iframeLoaded, afterCreate: hookIframe, afterUpdate: hookIframe })
          ])
        ])
      ]);
    }
  };

  var markupMatcher = window.createMarkupMatcher(projector, '<div class="landscape">\n  <div class="saucer">Flying saucer</div>\n</div>', getMarkup);

  return workbench;
};