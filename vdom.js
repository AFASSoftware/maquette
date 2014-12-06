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

  var flattenInto = function(insertions, main, mainIndex) {
    for (var i=0;i<insertions.length;i++) {
      var item = insertions[i];
      if (Array.isArray(item)) {
        mainIndex = flattenInto(item, main, mainIndex);
      } else {
        main.splice(mainIndex, 0, item);
        mainIndex++;
      }
    }
    return mainIndex;
  };

  // removes nulls, flattens embedded arrays
  var flatten = function(children) {
    if (children === null || children === undefined) {
      return null;
    }
    if (!Array.isArray(children)) {
      return [children];
    }
    var index = 0;
    for (var i=0;i<children.length;) {
      var child = children[i];
      if (!child) {
        children.splice(i,1);
      } else if (Array.isArray(child)) {
        children.splice(i,1);
        index = flattenInto(child, children, index);
      } else if (typeof child === "string") {
        children[i] = {
          vnodeSelector: "",
          text: child,
          domNode: null
        };
        i++; 
      } else {
        if (child.hasOwnProperty("vnodeSelector")) {
          i++
        } else {
          throw new Error("Not a valid vnode: "+child);
        }
      }
    }
    return children;
  };

  var setProperties = function(domNode, properties) {
    for (var propName in properties) {
      var propValue = properties[propName]
      if (propName === "class" || propName === "className") {
        throw new Error("Not supported, use 'classes' instead.");
      } else if (propName === "classes") {
        // object with string keys and boolean values
        for (var className in propValue) {
          if (propValue[className]) {
            domNode.classList.add(className);
          }
        }
      } else {
        domNode[propName] = propValue;
      }
    }
  };

  var addChildren = function(domNode, children, options) {
    children.forEach(function(child){
      createDom(child, options);
      domNode.appendChild(child.domNode);
    });
  };

  var classIdSplit = /([\.#]?[a-zA-Z0-9_:-]+)/;

  var createDom = function(vnode, options) {
    if (vnode.vnodeSelector === "") {
      vnode.domNode = document.createTextNode(vnode.text); 
    } else {
      var domNode;
      var tagParts = vnode.vnodeSelector.split(classIdSplit)
      for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i]
        if (!part) {
          continue;
        }
        type = part.charAt(0)
        if (!domNode) {
          // create domNode from the first part
          if (part === "svg") {
            options = {namespace: "http://www.w3.org/2000/svg"}; // extension not yet needed
          }
          if (options.namespace) {
            domNode = vnode.domNode = document.createElementNS(options.namespace, part)
          } else {
            domNode = vnode.domNode = document.createElement(part)
          }
        } else if (type === ".") {
          domNode.classList.add(part.substring(1));
        } else if (type === "#") {
          domNode.id = part.substr(1);
        }
      }
      setProperties(domNode, vnode.properties);
      addChildren(domNode, vnode.children, options);
    }
  };

  window.vdom = {
    h: function(tagName, properties, children) {
      if (!children && (typeof properties === "string" || Array.isArray(properties) || properties.hasOwnProperty("vnodeSelector"))) {
        children = properties;
        properties = null;
      }

      children = flatten(children);
      return {
        vnodeSelector: tagName,
        properties: properties,
        children: children,
        domNode: null
      };
    },

    mount: function(element, vnode) {
      createDom(vnode, {});
      element.appendChild(vnode.domNode);
      return {
        update: function(vnode, diff) {
          diff = diff || immediateDiff;
        }
      }
    }
  };

  window.vdom.h.text = function(key, text) {
    return {
      vnodeSelector: "",
      properties: {key: key},
      text: text,
      domNode: null
    };
  };

}())