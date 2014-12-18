(function (global) {

  "use strict";

  // constant flags
  var delayInsertDom = false; // don't care
  var skipUniqueSelectorCheck = false;
  var clearOldProperties = false; // only for nodes without a key
  var checkEqualsBeforeAssigningProperty = true; // true is fastest!

  // Utilities

  var noop = function () { };
  var emptyArray = [];

  var extend = function (base, overrides) {
    var result = {};
    Object.keys(base).forEach(function (key) {
      result[key] = base[key];
    });
    if (overrides) {
      Object.keys(overrides).forEach(function (key) {
        result[key] = overrides[key];
      });
    }
    return result;
  };

  // Hyperscript helper functions

  var flattenInto = function (parentSelector, insertions, main, mainIndex, selectorsThusFar) {
    for (var i = 0; i < insertions.length; i++) {
      var item = insertions[i];
      if (Array.isArray(item)) {
        mainIndex = flattenInto(item, main, mainIndex);
      } else {
        checkForDuplicateSelectors(parentSelector, item, selectorsThusFar);
        main.splice(mainIndex, 0, item);
        mainIndex++;
      }
    }
    return mainIndex;
  };

  var checkForDuplicateSelectors = function (parentSelector, sameAs, selectorsThusFar) {
    if (skipUniqueSelectorCheck) {
      return;
    }
    var selector = sameAs.vnodeSelector;
    if (selector === "") {
      return; // textnodes can be safely ignored.
    }
    if(sameAs.properties && sameAs.properties.key) {
      return; // uniqueness of keys is not checked for performance sake
    }
    for (var i = 0; i < selectorsThusFar.length; i++) {
      if (selector === selectorsThusFar[i]) {
        throw new Error("[" + parentSelector + "] contains undistinguishable child nodes [" + selector + "], please add unique key properties.");
      }
    }
    selectorsThusFar.push(selector);
  };

  var toTextVNode = function (data) {
    return {
      vnodeSelector: "",
      text: (data == null) ? "" : ("" + data),
      domNode: null
    };
  };

  // removes nulls, flattens embedded arrays
  var flatten = function (parentSelector, children) {
    if (children === null || children === undefined) {
      return null;
    }
    if (!Array.isArray(children)) {
      if (children.hasOwnProperty("vnodeSelector")) {
        return [children];
      } else {
        return [toTextVNode(children)];
      }
    }
    var index = 0;
    var selectorsThusFar = [];
    while (index < children.length) {
      var child = children[index];
      if (!child) {
        children.splice(index, 1);
      } else if (Array.isArray(child)) {
        children.splice(index, 1);
        index = flattenInto(parentSelector, child, children, index, selectorsThusFar);
      } else if (child.hasOwnProperty("vnodeSelector")) {
        checkForDuplicateSelectors(parentSelector, child, selectorsThusFar);
        index++;
      } else {
        children[index] = toTextVNode(child);
        index++;
      }
    }
    return children;
  };

  // Render helper functions

  var classIdSplit = /([\.#]?[a-zA-Z0-9_:-]+)/;

  var immediateTransitions = {
    nodeToRemove: function (node) {
      node.parentNode.removeChild(node);
    },
    nodeAdded: noop,
    nodeUpdated: noop
  };

  var defaultOptions = {
    namespace: null,
    transitions: immediateTransitions
  };

  var applyDefaultOptions = function (options) {
    return extend(defaultOptions, options);
  };

  var setProperties = function (domNode, properties, options) {
    if (!properties) {
      return;
    }
    var eventHandlerInterceptor = options.eventHandlerInterceptor;
    for (var propName in properties) {
      var propValue = properties[propName];
      if (propName === "class" || propName === "className" || propName === "classList") {
        throw new Error("Not supported, use 'classes' instead.");
      } else if (propName === "classes") {
        // object with string keys and boolean values
        for (var className in propValue) {
          if (propValue[className]) {
            domNode.classList.add(className);
          }
        }
      } else {
        if(eventHandlerInterceptor && typeof propValue === "function") {
          propValue = eventHandlerInterceptor(propName, propValue); // intercept eventhandlers
        }
        domNode[propName] = propValue;
      }
    }
  };

  var updateProperties = function (domNode, previousProperties, properties, options) {
    if (!properties) {
      return;
    }
    for (var propName in properties) {
      // assuming that properties will be nullified instead of missing is by design
      var propValue = properties[propName];
      var previousValue = previousProperties[propName];
      if (propName === "classes") {
        if (propValue === previousValue) {
          continue;
        }
        for (var className in propValue) {
          if(clearOldProperties) {
            previousValue = previousValue || {};
          }
          var on = !!propValue[className];
          var previousOn = !!previousValue[className];
          if (on === previousOn) {
            continue;
          }
          if (on) {
            domNode.classList.add(className);
          } else {
            domNode.classList.remove(className);
          }
        }
      } else {
        if (!propValue && typeof previousValue === "string") {
          propValue = "";
        }
        if(!clearOldProperties && typeof propValue === "function") {
          // Not updating functions is by design
          continue;
        } else {
          if (typeof propValue === "function") {
            if (options.eventHandlerInterceptor && propValue !== previousValue) {
              propValue = options.eventHandlerInterceptor(propName, propValue); // intercept eventhandlers
            } else {
              continue; // do not overwrite with unintercepted function
            }
          }
        }
        if (propName === "value") {
          if(domNode["value"] === propValue) {
            continue; // Otherwise the cursor position would get updated
          } else {
            domNode["value"] = propValue;
            continue;
          }
        }
        if(!checkEqualsBeforeAssigningProperty || propValue !== previousValue || propName === "value") {
          domNode[propName] = propValue;
        }
      }
    }
    if(clearOldProperties) {
      for(var propName2 in previousProperties) {
        if (!properties.hasOwnProperty(propName2)) {
          var previousValue2 = previousProperties[propName2];
          // nullify the value
          if(propName2 === "classes") {
            for(var oldClassName in previousValue2) {
              domNode.classList.remove(oldClassName);
            }
          } else if(typeof previousValue2 === "string") {
            domNode[propName2] = "";
          } else {
            domNode[propName2] = null;
          }
        }
      }
    }
  };

  var addChildren = function (domNode, children, options) {
    if (!children) {
      return;
    }
    children.forEach(function (child) {
      createDom(child, function (childDomNode) {
        domNode.appendChild(childDomNode);
      }, options);
    });
  };

  var same = function (vnode1, vnode2) {
    if (vnode1.vnodeSelector !== vnode2.vnodeSelector) {
      return false;
    }
    if (vnode1.properties && vnode2.properties) {
      return vnode1.properties.key === vnode2.properties.key;
    }
    return !vnode1.properties && !vnode2.properties;
  };

  var findIndexOfChild = function (children, sameAs, start) {
    if (sameAs.vnodeSelector !== "") {
      // Never scan for text-nodes
      for (var i = start; i < children.length; i++) {
        if (same(children[i], sameAs)) {
          return i;
        }
      }
    }
    return -1;
  };

  var updateChildren = function (domNode, oldChildren, newChildren, options) {
    if (oldChildren === newChildren) {
      return;
    }
    oldChildren = oldChildren || emptyArray;
    newChildren = newChildren || emptyArray;
    var transitions = options.transitions;

    var oldIndex = 0;
    var newIndex = 0;
    var i;
    while (newIndex < newChildren.length) {
      var oldChild = (oldIndex < oldChildren.length) ? oldChildren[oldIndex] : null;
      var newChild = newChildren[newIndex];
      if (oldChild && same(oldChild, newChild)) {
        updateDom(oldChild, newChild, options);
        oldIndex++;
      } else {
        var findOldIndex = findIndexOfChild(oldChildren, newChild, oldIndex + 1);
        if (findOldIndex >= 0) {
          // Remove preceding missing children
          for (i = oldIndex; i < findOldIndex; i++) {
            transitions.nodeToRemove(oldChildren[i].domNode);
          }
          updateDom(oldChildren[findOldIndex], newChild, options);
          oldIndex = findOldIndex + 1;
        } else {
          // New child
          createDom(newChild, function (childDomNode) {
            if (oldIndex < oldChildren.length) {
              var nextChild = oldChildren[oldIndex];
              nextChild.domNode.parentNode.insertBefore(childDomNode, nextChild.domNode);
            } else {
              domNode.appendChild(childDomNode);
            }
          }, options);
          transitions.nodeAdded(newChild.domNode);
        }
      }
      newIndex++;
    }
    if (oldChildren.length > oldIndex) {
      // Remove child fragments
      for (i = oldIndex; i < oldChildren.length; i++) {
        transitions.nodeToRemove(oldChildren[i].domNode);
      }
    }
  };

  var createDom = function (vnode, afterCreate, options) {
    if (vnode.vnodeSelector === "") {
      vnode.domNode = document.createTextNode(vnode.text);
      afterCreate(vnode.domNode);
    } else {
      var domNode, part, i, type;
      var tagParts = vnode.vnodeSelector.split(classIdSplit);
      for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];
        if (!part) {
          continue;
        }
        type = part.charAt(0);
        if (!domNode) {
          // create domNode from the first part
          if (part === "svg") {
            options = extend(options, { namespace: "http://www.w3.org/2000/svg" });
          }
          if (options.namespace) {
            domNode = vnode.domNode = document.createElementNS(options.namespace, part);
          } else {
            domNode = vnode.domNode = document.createElement(part);
          }
          !delayInsertDom && afterCreate(domNode);
        } else if (type === ".") {
          domNode.classList.add(part.substring(1));
        } else if (type === "#") {
          domNode.id = part.substr(1);
        }
      }
      initPropertiesAndChildren(domNode, vnode, options);
      delayInsertDom && afterCreate(domNode);
    }
  };

  var initPropertiesAndChildren = function (domNode, vnode, options) {
    setProperties(domNode, vnode.properties, options);
    addChildren(domNode, vnode.children, options);
    if (vnode.properties && vnode.properties.afterCreate) {
      vnode.properties.afterCreate(domNode, vnode.vnodeSelector, vnode.properties, vnode.children);
    }
  };

  var updateDom = function (previous, vnode, options) {
    var domNode = previous.domNode;
    if (!domNode) {
      throw new Error("previous node was not mounted");
    }
    if (previous === vnode) {
      return; // we assume that nothing has changed
    }
    if (vnode.vnodeSelector === "") {
      if (vnode.text !== previous.text) {
        domNode.nodeValue = vnode.text;
      }
    } else {
      updateProperties(domNode, previous.properties, vnode.properties, options);
      updateChildren(domNode, previous.children, vnode.children, options);
    }
    vnode.domNode = previous.domNode;
  };

  // polyfill for window.performance
  window.performance = (window.performance || {
    offset: new Date(),
    now: function now() {
      return new Date() - this.offset;
    }
  });

  var stats = {
    lastCreateVDom: null,
    lastCreateDom: null,
    lastUpdateVDom: null,
    lastUpdateDom: null,
    lastRenderLoop: null,
    createExecuted: function (timing1, timing2, timing3, renderLoop) {
      stats.lastRenderLoop = renderLoop;
      stats.lastCreateVDom = timing2 - timing1;
      stats.lastCreateDom = timing3 - timing2;
    },
    updateExecuted: function (timing1, timing2, timing3, renderLoop) {
      stats.lastRenderLoop = renderLoop;
      stats.lastUpdateVDom = timing2 - timing1;
      stats.lastUpdateDom = timing3 - timing2;
    }
  };

  var domsetter = {
    h: function (selector, properties, children) {
      if (!children && (typeof properties === "string" || Array.isArray(properties)
	      || (properties && properties.hasOwnProperty("vnodeSelector")))) {
        children = properties;
        properties = null;
      }
      children = flatten(selector, children);
      return {
        vnodeSelector: selector,
        properties: properties,
        children: children,
        domNode: null
      };
    },

    createDom: function (vnode, options) {
      options = applyDefaultOptions(options);
      createDom(vnode, noop, {});
      return {
        update: function (updatedVnode) {
          updateDom(vnode, updatedVnode, options);
          vnode = updatedVnode;
        },
        domNode: vnode.domNode
      };
    },

    mergeDom: function (element, vnode, options) {
      options = applyDefaultOptions(options);
      vnode.domNode = element;
      initPropertiesAndChildren(element, vnode, options);
      return {
        update: function (updatedVnode) {
          updateDom(vnode, updatedVnode, options);
          vnode = updatedVnode;
        },
        domNode: element
      };
    },

    renderLoop: function (element, renderFunction, options) {
      options = applyDefaultOptions(options);
      options.eventHandlerInterceptor = function (propertyName, functionPropertyArgument) {
        return function () {
          // intercept function calls (event handlers) to do a render afterwards.
          api.scheduleRender();
          return functionPropertyArgument.apply(this, arguments);
        };
      };
      var mount = null;
      var scheduled;
      var doRender = function () {
        scheduled = null;
        if (!mount) {
          var timing1 = window.performance.now();
          var vnode = renderFunction();
          var timing2 = window.performance.now();
          mount = domsetter.mergeDom(element, vnode, options);
          stats.createExecuted(timing1, timing2, window.performance.now(), api);
        } else {
          var updateTiming1 = window.performance.now();
          var updatedVnode = renderFunction();
          var updateTiming2 = window.performance.now();
          mount.update(updatedVnode);
          stats.updateExecuted(updateTiming1, updateTiming2, window.performance.now(), api);
        }
      };
      scheduled = requestAnimationFrame(doRender);
      var api = {
        scheduleRender: function () {
          if (!scheduled) {
            scheduled = requestAnimationFrame(doRender);
          }
        },
        destroy: function () {
          if (scheduled) {
            cancelAnimationFrame(scheduled);
            scheduled = null;
          }
        }
      };
      return api;
    },

    createCache: function () {
      var cachedValue = null;
      var cachedKeys = null;
      var result = {
        invalidate: function () {
          cachedValue = null;
          cachedKeys = null;
        },
        use: function (keys, renderFunction) {
          if (cachedKeys) {
            for (var i = 0; i < keys.length; i++) {
              if (cachedKeys[i] !== keys[i]) {
                cachedValue = null;
              }
            }
          }
          if (!cachedValue) {
            cachedValue = renderFunction();
            cachedKeys = keys;
          }
          return cachedValue;
        }
      };
      return result;
    },

    stats: stats,
  };

  if (global.module !== undefined && global.module.exports) {
    // Node and other CommonJS-like environments that support module.exports
    global.module.exports = domsetter;
  } else if (typeof global.define == 'function' && global.define.amd) {
    // AMD / RequireJS
    global.define(function () {
      return domsetter;
    });
  } else {
    // Browser
    global['domsetter'] = domsetter;
  }

})(this);