window.createNextButton = function (projector, getUnlocked) {

  var h = maquette.h;

  var removeLock = { opacity: [0, "easeInCubic", 1], scale: [4, "easeOutQuad", 1]};

  var handleClick = function(evt) {
    if (!getUnlocked()) {
      evt.preventDefault();
      alert("You need to complete the objectives before you can continue. If you already completed this assignment navigate to the index.");
    }
  }

  var nextButton = {
    renderMaquette: function () {
      var locked = !getUnlocked();
      return h("a", {onclick: handleClick}, [
        locked ? [
          h("i.mdi-action-lock.lock", {exitAnimation: removeLock})
        ] : []
      ]);
    }
  };

  return nextButton;
};
