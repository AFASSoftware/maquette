// The code below can be copy-pasted into the developer console to get a statistics view

(function () {

  var maquette = window.maquette;
  var h = maquette.h;

  if (window.maquetteShowStats) {
    window.maquetteShowStats.destroy();
  }

  var rootElement = document.createElement("maquette-stats");
  rootElement.style.position = "fixed";
  rootElement.style.top = "100px";
  rootElement.style.zIndex = "19999";
  rootElement.style.right = "0";
  rootElement.style.width = "50px";
  rootElement.style.height = "200px";
  rootElement.style.backgroundColor = "lightBlue";

  if (document.body) {
    document.body.appendChild(rootElement);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.appendChild(rootElement);
    });
  }

  var reRender = function (evt) {
    evt.preventDefault();
    if (maquette.stats.lastProjector) {
      maquette.stats.lastProjector.scheduleRender();
    }
  };

  var render = function () {
    var stats = maquette.stats;

    return h("maquette-stats", [
      h("div", {}, ["Stats"]),
      h("div#1", {}, ["" + stats.lastCreateVDom]),
      h("div#2", {}, ["" + stats.lastCreateDom]),
      h("div#3", {}, ["" + stats.lastUpdateVDom]),
      h("div#4", {}, ["" + stats.lastUpdateDom]),
      stats.lastProjector ? h("button", { onclick: reRender }, ["Render"]) : null
    ]);
  };

  var mount = maquette.mergeDom(rootElement, render());

  var tick = function () {
    mount.update(render());
    interval = setTimeout(tick, 100);
  };

  var interval = window.setTimeout(tick, 100);

  window.maquetteShowStats = {
    destroy: function () {
      window.clearInterval(interval);
      document.body.removeChild(rootElement);
    }
  };

})();
