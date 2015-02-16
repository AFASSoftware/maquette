window.createNavigation = function (projector, previousUrl, nextUrl, isNextEnabled) {

  // constants
  var h = maquette.h;

  var navigation = {
    renderMaquette: function () {
      return h("div.navigation", [
        previousUrl ? [
          h("a.previous", { href: previousUrl }, ["Previous"])
        ] : [
          h("span.placeholder", {key: "previous"})
        ],
        h("a.index", {href: "index.html"}, ["Index"]),
        (nextUrl && isNextEnabled()) ? [
          h("a.next", { href: nextUrl }, ["Next"])
        ] : [
          h("span.placeholder", { key: "next" })
        ]
      ]);
    }
  };

  return navigation;
};