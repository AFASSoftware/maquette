window.createWorkbench = function (projector, scriptTabs, objectives) {

  if(typeof scriptTabs === "string") {
    scriptTabs = [{ name: "saucer.js", url: scriptTabs }];
  }

  // constants
  var h = maquette.h;
  var htmlStart = "<!doctype html><html><head><link href='assets/saucer.css' rel='stylesheet' /><script src='bower_components/maquette/dist/maquette.min.js'><" + "/script><script>";
  var htmlEnd = "<" + "/script></head><body></body></html>";

  var scripts = [];
  var scriptsValid = [];

  var lastValidScript = ""; // all scripts concatenated
  var htmlFile = "";
  var cssFile = "";
  var validateTimeout;
  var parseError;
  var editor;
  var contentWindow;
  var currentTab = 2;

  htmlStart = htmlStart
    + "var lastError;"
    + "window.onerror = function (msg, url, lineNumber, colNr, error) {"
    + "  if (!lastError) {"
    + "    lastError = { msg: msg, lineNumber: lineNumber };"
    + "    setTimeout(function() {"
    + "      var errorDiv = document.createElement(\"div\");"
    + "      errorDiv.classList.add(\"javascript-error\");"
    + "      errorDiv.appendChild(document.createTextNode(\"Javascript crash: \"+msg + (lineNumber > 1 ? (\" line number \"+lineNumber) : \"\")));"
    + "      document.body.appendChild(errorDiv);"
    + "    });"
    + "  }"
    + "};";

  var get = function (url, onComplete) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        projector.scheduleRender();
        onComplete(request.responseText);
      }
    };
    request.open("GET", url);
    request.send();
  };

  var updateLastValidScript = function () {
    if(!scriptsValid.some(function (valid) { return !valid; })) {
      lastValidScript = scripts.join("");
    }
  };

  scriptTabs.forEach(function (scriptTab, index) {
    scripts[index] = "";
    scriptsValid[index] = false;
    get(scriptTab.url, function (responseText) {
      scripts[index] = responseText;
      scriptsValid[index] = true;
      updateLastValidScript();
      if(editor && currentTab >= 2) {
        editor.setValue(scripts[currentTab-2], 0);
        editor.focus();
        editor.clearSelection();
      }
    });
  });

  setTimeout(function () {
    // wait a short time before fetching these
    get("assets/saucer.html", function (responseText) {
      htmlFile = responseText;
      if (editor && currentTab === 0) {
        editor.setValue(htmlFile, 0);
        editor.clearSelection();
      }
    });

    get("assets/saucer.css", function (responseText) {
      cssFile = responseText;
      if (editor && currentTab === 1) {
        editor.setValue(cssFile, 0);
        editor.clearSelection();
      }
    });

  }, 500);

  var iframeBodyObserver = new MutationObserver(function (mutations) {
    console.log("MutationObserver fired");
    objectives.forEach(function (objective) {
      objective.onSceneUpdate(contentWindow);
    });
    projector.scheduleRender();
  });

  var iframeLoaded = function (evt) {
    console.log("IFrame onload fired");
    contentWindow = evt.target.contentWindow;
    iframeBodyObserver.disconnect();
    iframeBodyObserver.observe(evt.target.contentWindow.document.body, { childList: true, attributes: true, characterData: true, subtree: true });
  };

  var lastScrdoc;
  var applySrcdoc = ("srcdoc" in document.createElement("iframe")) ? null : function (iframe, projectionOptions, selector, properties, children) {
    if (properties.srcdoc !== lastScrdoc) {
      // Polyfill for browsers who do not support the HTML5 srcdoc
      var jsUrl = "javascript: window.frameElement.getAttribute('srcdoc');";
      iframe.setAttribute("src", jsUrl);
      if (iframe.contentWindow && iframe.contentWindow.document.body) {
        iframe.contentWindow.document.body.innerHTML = "";
        iframe.contentWindow.location = jsUrl;
      }
      lastScrdoc = properties.srcdoc;
    }
  };

  var throttleValidateScript = function () {
    if (validateTimeout) {
      clearTimeout(validateTimeout);
    }
    validateTimeout = setTimeout(validateScript, 50);
  };

  // Super-fast way to validate the javascript
  var validateScript = function () {
    validateTimeout = null;
    if (currentTab >= 2) {
      try {
        var script = editor.getValue();
        scripts[currentTab-2] = script;
        var test = new Function(script);
        scriptsValid[currentTab - 2] = true;
        updateLastValidScript();
        parseError = null;
      } catch(e) {
        scriptsValid[currentTab - 2] = false;
        parseError = e.message;
      };
      projector.scheduleRender();
    }
  };

  var createEditor = function (div) {
    editor = ace.edit(div);
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);
    editor.setHighlightActiveLine(false);
    editor.setShowPrintMargin(false);
    refreshEditor();
    editor.setBehavioursEnabled(true);

    //editor.getSession().on("changeAnnotation", validateScriptUsingAce);
    editor.getSession().on("change", throttleValidateScript);
  };

  var refreshEditor = function () {
    switch(currentTab) {
      case 0:
        editor.setValue(htmlFile, 0);
        editor.getSession().setMode({ path: "ace/mode/html", v: new Date() });
        editor.setReadOnly(true);
        break;
      case 1:
        editor.setValue(cssFile, 0);
        editor.getSession().setMode({ path: "ace/mode/css", v: new Date() });
        editor.setReadOnly(true);
        break;
      default:
        editor.setValue(scripts[currentTab-2], 0);
        editor.getSession().setMode({ path: "ace/mode/javascript", v: new Date() });
        editor.setReadOnly(false);
        editor.focus();
        break;
    }
    editor.clearSelection();
    editor.gotoLine(0);
  };

  var generateSwitchTo = function (newTabIndex) {
    return function (evt) {
      evt.preventDefault();
      currentTab = newTabIndex;
      refreshEditor();
    };
  };

  var switchToHtml = generateSwitchTo(0);
  var switchToCss = generateSwitchTo(1);
  var switchToScripts = [];
  scriptTabs.forEach(function (scriptTab, index) {
    switchToScripts[index] = generateSwitchTo(index + 2);
  });

  var workbench = {
    allObjectivesAchieved : function () {
      return objectives.every(function (objective) {
         return objective.isAchieved();
      });
    },
    getScript: function () {
      return editor.getValue();
    },
    renderMaquette: function () {
      var currentObjectiveHad = false;
      var html = htmlStart + lastValidScript + htmlEnd;

      return h("div.work", [
        h("div.input", [
          h("div.tabs", [
            h("button.tab", { key: 1, onclick: switchToHtml, classes: { active: currentTab === 0 } }, ["saucer.html"]),
            h("button.tab", { key: 2, onclick: switchToCss, classes: { active: currentTab === 1 } }, ["saucer.css"]),
            scriptTabs.map(function (scriptTab, index) {
              return h("button.tab", { key: 3 + index, onclick: switchToScripts[index], classes: { active: currentTab === 2 } }, [scriptTab.name]);
            })
          ]),
          h("div.editor", { afterCreate: createEditor }),
          h("div.parseError", [parseError])
        ]),
        h("div.result", [
          h("div.header", ["Objectives"]),
          h("div.objectives",
            objectives.map(function (objective, index) {
              var current = !currentObjectiveHad && !objective.isAchieved();
              if(current) {
                currentObjectiveHad = true;
              }
              return h("section.objective", { key: index, classes: {achieved: objective.isAchieved(), current: current, "future": !current && currentObjectiveHad} }, [
                h("header", [
                  h("span", ["" + (index + 1) + ". " + objective.title]),
                  objective.isAchieved() ? h("span.result.achieved", ["\u2713"]) : []
                ]),
                current ? [
                  h("div.detail", [
                    objective.renderMaquette()
                  ])
                ] : []
              ]);
            })
          ),
          h("div.preview", [
            lastValidScript ? [
              h("iframe", { srcdoc: html, onload: iframeLoaded, afterCreate: applySrcdoc, afterUpdate: applySrcdoc })
            ] : []
          ])
        ])
      ]);
    }
  };

  return workbench;
};
