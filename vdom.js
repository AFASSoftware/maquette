(function(){

  var immediateDiff = {
    nodeAdded: function (node) {
    },
    nodeToRemove: function (node) {
      node.parentNode.removeChild(node);
    },
    nodeUpdated: function (node) {
    }
  };

  window.vdom = {
    h: function(){

    },

    mount: function(element, vnode) {
      return {
        update: function(vnode, diff) {
          diff = diff || immediateDiff;
        }
      }
    }


  }
}())