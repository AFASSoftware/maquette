(function( window ) {
  'use strict';
  var domsetter = window.domsetter;
  var h = domsetter.h;
  
  var render = function() {
    return h("section#todoapp");
  };
  
  document.addEventListener('DOMContentLoaded', function() {
    domsetter.renderLoop(document.getElementById("todoapp"), render, {});
  });

})( window );
