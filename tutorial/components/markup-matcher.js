window.createMarkupMatcher = function (projector, desiredMarkup, getContentWindow) {

  // constants
  var h = maquette.h;

  var markupMatchedPrefix = "";
  var markupWrong = "";
  var markupMissing = desiredMarkup;
  var markupMatchedSuffix = "";

  var lastMarkup = "";

  var verify = function () {
    var contentWindow = getContentWindow();
    var markup = contentWindow ? contentWindow.document.body.innerHTML : "";
    if(markup !== lastMarkup) {
      lastMarkup = markup;
      var matchedUntil = 0;
      var checkChar = desiredMarkup.charAt(0);
      var used = 0;
      var i;
      for (i = 0; i < markup.length; i++) {
        if(markup.charAt(i) === " ") continue;
        if(checkChar === markup.charAt(i)) {
          do {
            matchedUntil++;
            checkChar = desiredMarkup.charAt(matchedUntil);
          } while(checkChar === " " || checkChar === "\n");
        } else {
          used = i-1;
          break;
        }
      }
      markupWrong = "";
      var lastMatchedUntil = desiredMarkup.length - 1;
      checkChar = desiredMarkup.charAt(lastMatchedUntil);
      if(matchedUntil < desiredMarkup.length-1) {
        for (i = markup.length - 1; i > used; i--) {
          if (markup.charAt(i) === " ") continue;
          if(checkChar === markup.charAt(i)) {
            do {
              lastMatchedUntil--;
              checkChar = desiredMarkup.charAt(lastMatchedUntil);
            } while(checkChar === " " || checkChar === "\n");
          } else {
            markupWrong = markup.substr(used + 1, i - used);
            break;
          }
        }
      }
      if(markupWrong === "" && desiredMarkup.charAt(matchedUntil - 1) === "<" && checkChar === "<") {
        matchedUntil--;
        lastMatchedUntil--;
      }
      markupMatchedPrefix = desiredMarkup.substr(0, matchedUntil);
      markupMissing = desiredMarkup.substr(matchedUntil, lastMatchedUntil + 1 - matchedUntil);
      markupMatchedSuffix = desiredMarkup.substr(lastMatchedUntil + 1);
    }
  };

  return {
    renderMaquette: function () {
      verify();

      return h("code.markup-matcher", [
        h("pre", [
          h("span.ok", { key: "prefix" }, [markupMatchedPrefix]),
          h("span.wrong", [markupWrong]),
          h("span.missing", [markupMissing]),
          h("span.ok", {key: "suffix"}, [markupMatchedSuffix])
      ])
      ]);
    }
  };
};