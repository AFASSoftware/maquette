window.createMarkupMatcher = function (projector, desiredMarkup) {

  // constants
  var h = maquette.h;

  var markupMatchedPrefix = "";
  var markupWrong = "";
  var markupMissing = desiredMarkup;
  var markupMatchedSuffix = "";
  var achieved = false;

  var lastMarkup = "";

  return {
    title: "Render the DOM",
    isAchieved: function () {
      return achieved;
    },
    onSceneUpdate: function (contentWindow) {
      if(achieved) {
        return;
      }
      var markup = "";
      if (!contentWindow.document.body.querySelector(".javascript-error")) {
        markup = contentWindow.document.body.innerHTML;
      }
      if (markup !== lastMarkup) {
        lastMarkup = markup;
        var matchedUntil = 0;
        var checkChar = desiredMarkup.charAt(0);
        var used = 0;
        var i;
        for (i = 0; i < markup.length; i++) {
          if (markup.charAt(i) === " ") continue;
          if (checkChar === markup.charAt(i)) {
            do {
              matchedUntil++;
              checkChar = desiredMarkup.charAt(matchedUntil);
            } while (checkChar === " " || checkChar === "\n");
          } else {
            used = i - 1;
            break;
          }
        }
        markupWrong = "";
        var lastMatchedUntil = desiredMarkup.length - 1;
        checkChar = desiredMarkup.charAt(lastMatchedUntil);
        if (matchedUntil < desiredMarkup.length - 1) {
          for (i = markup.length - 1; i > used; i--) {
            if (markup.charAt(i) === " ") continue;
            if (checkChar === markup.charAt(i)) {
              do {
                lastMatchedUntil--;
                checkChar = desiredMarkup.charAt(lastMatchedUntil);
              } while (checkChar === " " || checkChar === "\n");
            } else {
              markupWrong = markup.substr(used + 1, i - used);
              break;
            }
          }
        }
        if (markupWrong === "" && desiredMarkup.charAt(matchedUntil - 1) === "<" && checkChar === "<") {
          matchedUntil--;
          lastMatchedUntil--;
        }
        markupMatchedPrefix = desiredMarkup.substr(0, matchedUntil);
        markupMissing = desiredMarkup.substr(matchedUntil, lastMatchedUntil + 1 - matchedUntil);
        markupMatchedSuffix = desiredMarkup.substr(lastMatchedUntil + 1);

        achieved = (markupWrong === "" && markupMissing === "");
      }
    },
    renderMaquette: function () {
      return [
        h("p", ["Make sure the DOM matches the following markup"]),
        h("code.markup-matcher", [
          h("pre", [
            h("span.ok", { key: "prefix" }, [markupMatchedPrefix]),
            h("span.wrong", [markupWrong]),
            h("span.missing", [markupMissing]),
            h("span.ok", {key: "suffix"}, [markupMatchedSuffix])
          ])
        ])
      ];
    }
  };
};
