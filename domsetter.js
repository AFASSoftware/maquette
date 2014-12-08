(function (global) {

  "use strict";

  var immediateDiff = {
    nodeToRemove: function (node) {
      node.parentNode.removeChild(node);
    },
    nodeAdded: function (node) {
    },
    nodeUpdated: function (node) {
    }
  };

  var extend = function (base, overrides) {
    var result = {};
    Object.keys(base).forEach(function (key) {
      result[key] = base[key];
    });
    Object.keys(overrides).forEach(function (key) {
      result[key] = overrides[key];
    });
    return result;
  };

  var emptyArray = [];

  var flattenInto = function (insertions, main, mainIndex) {
    for(var i = 0; i < insertions.length; i++) {
      var item = insertions[i];
      if(Array.isArray(item)) {
        mainIndex = flattenInto(item, main, mainIndex);
      } else {
        main.splice(mainIndex, 0, item);
        mainIndex++;
      }
    }
    return mainIndex;
  };

  // removes nulls, flattens embedded arrays
  var flatten = function (children) {
    if(children === null || children === undefined) {
      return null;
    }
    if(!Array.isArray(children)) {
      return [children];
    }
    var index = 0;
    while(index < children.length) {
      var child = children[index];
      if(!child) {
        children.splice(index, 1);
      } else if(Array.isArray(child)) {
        children.splice(index, 1);
        index = flattenInto(child, children, index);
      } else if(typeof child === "string") {
        children[index] = {
          vnodeSelector: "",
          text: child,
          domNode: null
        };
        index++;
      } else {
        if(child.hasOwnProperty("vnodeSelector")) {
          index++;
        } else {
          throw new Error("Not a valid vnode: " + child);
        }
      }
    }
    return children;
  };

  var setProperties = function (domNode, properties) {
    if(!properties) {
      return;
    }
    for(var propName in properties) {
      var propValue = properties[propName];
      if(propName === "class" || propName === "className" || propName === "classList") {
        throw new Error("Not supported, use 'classes' instead.");
      } else if(propName === "classes") {
        // object with string keys and boolean values
        for(var className in propValue) {
          if(propValue[className]) {
            domNode.classList.add(className);
          }
        }
      } else {
        domNode[propName] = propValue;
      }
    }
  };

  var updateProperties = function (domNode, previousProperties, properties) {
    if(!properties) {
      return;
    }
    for(var propName in properties) {
      // assuming that properties will be nullified instead of missing is by design
      var propValue = properties[propName];
      var previousValue = previousProperties[propName];
      if(propValue === previousValue) {
        continue;
      }
      if(propName === "classes") {
        for(var className in propValue) {
          var on = !!propValue[className];
          var previousOn = !!previousValue[className];
          if(on === previousOn) {
            continue;
          }
          if(on) {
            domNode.classList.add(className);
          } else {
            domNode.classList.remove(className);
          }
        }
      } else {
        if(!propValue && typeof previousValue === "string") {
          propValue = "";
        }
		if (previousValue !== propValue && typeof previousValue !== "function") {
		  // Not updating functions is by design
          domNode[propName] = propValue;
		}
      }
    }
  };

  var addChildren = function (domNode, children, options) {
    if(!children) {
      return;
    }
    children.forEach(function (child) {
      createDom(child, options);
      domNode.appendChild(child.domNode);
    });
  };

  var same = function (vnode1, vnode2) {
    if(vnode1.vnodeSelector !== vnode2.vnodeSelector) {
      return false;
    }
    if(vnode1.properties && vnode2.properties) {
      return vnode1.properties.key === vnode2.properties.key;
    }
	if (vnode1.hasOwnProperty("text")) {
	  return vnode1.text === vnode2.text;
	}
    return !vnode1.properties && !vnode2.properties;
  };

  var indexOfChild = function (children, sameAs, start) {
    for(var i = start; i < children.length; i++) {
      if(same(children[i], sameAs)) {
        return i;
      }
    }
    return -1;
  };

  var updateChildren = function (domNode, oldChildren, newChildren, options) {
    if(oldChildren === newChildren) {
      return;
    }
    oldChildren = oldChildren || emptyArray;
    newChildren = newChildren || emptyArray;
    var diff = options.diff;

    var oldIndex = 0;
    var newIndex = 0;
    var i;
    while(newIndex < newChildren.length) {
      var oldChild = (oldIndex < oldChildren.length) ? oldChildren[oldIndex] : null;
      var newChild = newChildren[newIndex];
      if(oldChild && same(oldChild, newChild)) {
        updateDom(oldChild, newChild, options);
        oldIndex++;
      } else {
        var findOldIndex = indexOfChild(oldChildren, newChild, oldIndex + 1);
        if(findOldIndex >= 0) {
          // Remove preceding missing children
          for(i = oldIndex; i < findOldIndex; i++) {
            diff.nodeToRemove(oldChildren[i].domNode);
          }
          updateDom(oldChildren[findOldIndex], newChild, options);
          oldIndex = findOldIndex + 1;
        } else {
          // New child
          createDom(newChild, options);
          if(oldIndex < oldChildren.length) {
            var nextChild = oldChildren[oldIndex];
            nextChild.domNode.parentNode.insertBefore(newChild.domNode, nextChild.domNode);
          } else {
            domNode.appendChild(newChild.domNode);
          }
          diff.nodeAdded(newChild.domNode);
        }
      }
      newIndex++;
    }
    if(oldChildren.length > oldIndex) {
      // Remove child fragments
      for(i = oldIndex; i < oldChildren.length; i++) {
        diff.nodeToRemove(oldChildren[i].domNode);
      }
    }
  };

  var classIdSplit = /([\.#]?[a-zA-Z0-9_:-]+)/;

  var createDom = function (vnode, options) {
    if(vnode.vnodeSelector === "") {
      vnode.domNode = document.createTextNode(vnode.text);
    } else {
      var domNode, part, i, type;
      var tagParts = vnode.vnodeSelector.split(classIdSplit);
      for(i = 0; i < tagParts.length; i++) {
        part = tagParts[i];
        if(!part) {
          continue;
        }
        type = part.charAt(0);
        if(!domNode) {
          // create domNode from the first part
          if(part === "svg") {
            options = extend(options, { namespace: "http://www.w3.org/2000/svg" }); // extension not yet needed
          }
          if(options.namespace) {
            domNode = vnode.domNode = document.createElementNS(options.namespace, part);
          } else {
            domNode = vnode.domNode = document.createElement(part);
          }
        } else if(type === ".") {
          domNode.classList.add(part.substring(1));
        } else if(type === "#") {
          domNode.id = part.substr(1);
        }
      }
      setProperties(domNode, vnode.properties);
      addChildren(domNode, vnode.children, options);
      if(vnode.properties && vnode.properties.afterCreate) {
        vnode.properties.afterCreate(domNode, vnode.vnodeSelector, vnode.properties, vnode.children);
      }
    }
  };

  var updateDom = function (previous, vnode, options) {
    var domNode = previous.domNode;
    if(!domNode) {
      throw new Error("previous node was not mounted");
    }
    if(previous === vnode) {
      return; // we assume that nothing has changed
    }
    if (vnode.vnodeSelector === "") {
      if(vnode.text !== previous.text) {
        vnode.domNode = document.createTextNode(vnode.text);
        return;
      }
    } else {
      updateProperties(domNode, previous.properties, vnode.properties);
      updateChildren(domNode, previous.children, vnode.children, options);
    }
    vnode.domNode = previous.domNode;
  };

  var domsetter = {
    h: function (tagName, properties, children) {
      if(!children && (typeof properties === "string" || Array.isArray(properties) 
	      || (properties && properties.hasOwnProperty("vnodeSelector")))) {
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

    mount: function (element, vnode) {
      createDom(vnode, {});
      element.appendChild(vnode.domNode);
      return {
        update: function (updatedVnode, options) {
          options = options || {};
          if(!options.diff) {
            options.diff = immediateDiff;
          }
          updateDom(vnode, updatedVnode, options);
          vnode = updatedVnode;
        }
      };
    },

    renderLoop: function (element, renderFunction, options) {
      var scheduled = null;
	  var vnode = domsetter.h("placeholder", {}, []);
	  vnode.domNode = element;
      var doUpdate = function () {
        scheduled = null;
		var updatedVnode = renderFunction();
        updateDom(vnode, updatedVnode, options);
        vnode = updatedVnode;
      };
      var result = {
        update: function () {
          if(!scheduled) {
            scheduled = requestAnimationFrame(doUpdate);
          }
        },
        destroy: function () {
          if(scheduled) {
            cancelAnimationFrame(scheduled);
          }
        }
      };
	  result.update();
	  return result;
    }
  };

  domsetter.h.text = function (key, text) {
    return {
      vnodeSelector: "",
      properties: { key: key },
      text: text,
      domNode: null
    };
  };

  if (global.module !== undefined && global.module.exports) {
    // Node and other CommonJS-like environments that support module.exports
    module.exports = domsetter;
  } else if (typeof global.define == 'function' && global.define.amd) {
    // AMD / RequireJS
    define(function () {
      return domsetter;
    });
  } else {
    // Browser
    global['domsetter'] = domsetter;
  }

})(this);