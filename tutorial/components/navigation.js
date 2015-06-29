(function(){

  var h = maquette.h;
  
  var levels = [
    "01-intro.html",
    "02-variables-and-properties.html",
    "03-rotation.html",
    "04-input.html",
    "05-rotation-input.html",
    "06-how-it-works.html",
    "07-rotation.html",
    "08-classes.html",
    "09-stealth.html",
    "10-distinguishable.html",
    "11-rotation-and-stealth.html",
    "12-done.html",
    "13-finish.html",
    "14-finale.html",
    "12-done.html"
  ];
  
  var lockPath = "M24.875,15.334v-4.876c0-4.894-3.981-8.875-8.875-8.875s-8.875,3.981-8.875,8.875v4.876H5.042v15.083h21.916V15.334H24.875zM10.625,10.458c0-2.964,2.411-5.375,5.375-5.375s5.375,2.411,5.375,5.375v4.876h-10.75V10.458zM18.272,26.956h-4.545l1.222-3.667c-0.782-0.389-1.324-1.188-1.324-2.119c0-1.312,1.063-2.375,2.375-2.375s2.375,1.062,2.375,2.375c0,0.932-0.542,1.73-1.324,2.119L18.272,26.956z";
  
  window.createNavigation = function (projector, getUnlocked) {
    getUnlocked = getUnlocked || function() {return true;};

    var currentLevel = document.location.pathname;
    currentLevel = currentLevel.substr(currentLevel.lastIndexOf("/")+1);
    var levelIndex = levels.indexOf(currentLevel);
    if (levelIndex === -1) {
      throw new Error("Level not registered: "+currentLevel);
    }
  
    var removeLockAnimation = function(element, removeElement) {
      window.Velocity.animate(element, { opacity: [0, "easeInCubic", 1], scale: [4, "easeOutQuad", 1]}, removeElement);
    };
  
    var handleClick = function(evt) {
      if (!getUnlocked()) {
        evt.preventDefault();
        if (confirm("You need to complete the objectives before you may proceed. Do you want to go to the tutoral index?")) {
          document.location = "/tutorial/index.html";
        }
      }
    }
  
    var navigation = {
      
      renderMaquette: function () {
        var locked = !getUnlocked();
        
        return h("div.menu", [
          levelIndex > 0 ? [
            h("a", { href: levels[levelIndex - 1] }, ["Previous"])
          ] : [],
          levelIndex < levels.length-1 ? [
            h("a.locked", {onclick: handleClick, href: levels[levelIndex + 1]}, [
              locked ? [
                h("svg", {viewBox: "0 0 32 32", exitAnimation: removeLockAnimation}, [
                  h("path", {d: lockPath})
                ])
              ] : [],
              "Next"
            ])
          ] : []
        ]);
      }
    };
  
    return navigation;
  };

}());