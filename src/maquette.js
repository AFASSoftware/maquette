(function (global) {

  "use strict";

  // constant flags
  var skipUniqueSelectorCheck = false;

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
        mainIndex = flattenInto(parentSelector, item, main, mainIndex, selectorsThusFar);
      } else {
        if (item !== null && item !== undefined) {
          if (item.hasOwnProperty("vnodeSelector")) {
            checkForDuplicateSelectors(parentSelector, item, selectorsThusFar);
          } else {
            item = toTextVNode(item);
          }
          main.splice(mainIndex, 0, item);
          mainIndex++;
        }
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
    if (sameAs.properties && sameAs.properties.key) {
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
      text: (data === null || data === undefined) ? "" : data.toString(),
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
      if (child === null || child === undefined) {
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
    nodeToRemove: function (node, properties) {
      node.parentNode.removeChild(node);
    },
    nodeAdded: function (node, properties) {
    },
    nodeUpdated: function (node, type, name, newValue, oldValue) {
    }
  };

  var defaultProjectionOptions = {
    namespace: null,
    transitions: immediateTransitions
  };

  var applyDefaultProjectionOptions = function (projectionOptions) {
    return extend(defaultProjectionOptions, projectionOptions);
  };

  var setProperties = function (domNode, properties, projectionOptions) {
    if (!properties) {
      return;
    }
    var eventHandlerInterceptor = projectionOptions.eventHandlerInterceptor;
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
      } else if (propName === "key") {
        continue;
      } else if (propValue === null || propValue === undefined) {
        continue;
      } else {
        var type = typeof propValue;
        if (type === "function") {
          if (eventHandlerInterceptor && (propName.lastIndexOf("on", 0) === 0)) { // lastIndexOf(,0)===0 -> startsWith
            propValue = eventHandlerInterceptor(propName, propValue, domNode); // intercept eventhandlers
            if (propName === "oninput") {
              (function () {
                // record the evt.target.value, because IE sometimes does a requestAnimationFrame between changing value and running oninput
                var tmp = propValue;
                propValue = function (evt) {
                  evt.target["oninput-value"] = evt.target.value;
                  tmp.apply(this, [evt]);
                };
              }());
            }
          }
          domNode[propName] = propValue;
        } else if (type === "string" && propName !== "value") {
          domNode.setAttribute(propName, propValue);
        } else {
          domNode[propName] = propValue;
        }
      }
    }
  };

  var updateProperties = function (domNode, previousProperties, properties, projectionOptions) {
    if (!properties) {
      return;
    }
    var transitions = projectionOptions.transitions;
    for (var propName in properties) {
      // assuming that properties will be nullified instead of missing is by design
      var propValue = properties[propName];
      var previousValue = previousProperties[propName];
      if (propName === "classes") {
        if (propValue === previousValue) {
          continue;
        }
        var classList = domNode.classList;
        for (var className in propValue) {
          var on = !!propValue[className];
          var previousOn = !!previousValue[className];
          if (on === previousOn) {
            continue;
          }
          if (on) {
            classList.add(className);
            transitions.nodeUpdated(domNode, "addClass", className, undefined, undefined);
          } else {
            classList.remove(className);
            transitions.nodeUpdated(domNode, "removeClass", className, undefined, undefined);
          }
        }
      } else {
        if (!propValue && typeof previousValue === "string") {
          propValue = "";
        }
        if (propName === "value") { // value can be manipulated by the user directly and using event.preventDefault() is not an option
          if (domNode[propName] !== propValue && domNode["oninput-value"] !== propValue) {
            domNode[propName] = propValue; // Reset the value, even if the virtual DOM did not change
          } // else do not update the domNode, otherwise the cursor position would be changed
          if (propValue !== previousValue) {
            transitions.nodeUpdated(domNode, "property", propName, propValue, previousValue);
          }
        } else if (propValue !== previousValue) {
          var type = typeof propValue;
          if (type === "function") {
            throw new Error("Functions may not be updated on subsequent renders (property: " + propName + ")");
          }
          if (type === "string") {
            domNode.setAttribute(propName, propValue);
          } else {
            domNode[propName] = propValue;
          }
          transitions.nodeUpdated(domNode, "property", propName, propValue, previousValue);
        }
      }
    }
  };

  var addChildren = function (domNode, children, projectionOptions) {
    if (!children) {
      return;
    }
    children.forEach(function (child) {
      createDom(child, function (childDomNode) {
        domNode.appendChild(childDomNode);
      }, projectionOptions);
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

  var updateChildren = function (domNode, oldChildren, newChildren, projectionOptions) {
    if (oldChildren === newChildren) {
      return;
    }
    oldChildren = oldChildren || emptyArray;
    newChildren = newChildren || emptyArray;
    var transitions = projectionOptions.transitions;

    var oldIndex = 0;
    var newIndex = 0;
    var i;
    var insertChild = function (childDomNode) {
      if (oldIndex < oldChildren.length) {
        var nextChild = oldChildren[oldIndex];
        domNode.insertBefore(childDomNode, nextChild.domNode);
      } else {
        domNode.appendChild(childDomNode);
      }
    };
    while (newIndex < newChildren.length) {
      var oldChild = (oldIndex < oldChildren.length) ? oldChildren[oldIndex] : null;
      var newChild = newChildren[newIndex];
      if (oldChild && same(oldChild, newChild)) {
        updateDom(oldChild, newChild, projectionOptions);
        oldIndex++;
      } else {
        var findOldIndex = findIndexOfChild(oldChildren, newChild, oldIndex + 1);
        if (findOldIndex >= 0) {
          // Remove preceding missing children
          for (i = oldIndex; i < findOldIndex; i++) {
            transitions.nodeToRemove(oldChildren[i].domNode, oldChildren[i].properties);
          }
          updateDom(oldChildren[findOldIndex], newChild, projectionOptions);
          oldIndex = findOldIndex + 1;
        } else {
          // New child
          createDom(newChild, insertChild, projectionOptions);
          transitions.nodeAdded(newChild.domNode, newChild.properties);
        }
      }
      newIndex++;
    }
    if (oldChildren.length > oldIndex) {
      // Remove child fragments
      for (i = oldIndex; i < oldChildren.length; i++) {
        transitions.nodeToRemove(oldChildren[i].domNode, oldChildren[i].properties);
      }
    }
  };

  var createDom = function (vnode, afterCreate, projectionOptions) {
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
            projectionOptions = extend(projectionOptions, { namespace: "http://www.w3.org/2000/svg" });
          }
          if (projectionOptions.namespace) {
            domNode = vnode.domNode = document.createElementNS(projectionOptions.namespace, part);
          } else {
            domNode = vnode.domNode = document.createElement(part);
          }
          afterCreate(domNode);
        } else if (type === ".") {
          domNode.classList.add(part.substring(1));
        } else if (type === "#") {
          domNode.id = part.substr(1);
        }
      }
      initPropertiesAndChildren(domNode, vnode, projectionOptions);
    }
  };

  var initPropertiesAndChildren = function (domNode, vnode, projectionOptions) {
    setProperties(domNode, vnode.properties, projectionOptions);
    addChildren(domNode, vnode.children, projectionOptions);
    if (vnode.properties && vnode.properties.afterCreate) {
      vnode.properties.afterCreate(domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children);
    }
  };

  var updateDom = function (previous, vnode, projectionOptions) {
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
        projectionOptions.transitions.nodeUpdated(domNode, "text", undefined, vnode.text, previous.text);
      }
    } else {
      updateProperties(domNode, previous.properties, vnode.properties, projectionOptions);
      updateChildren(domNode, previous.children, vnode.children, projectionOptions);
      if (vnode.properties && vnode.properties.afterUpdate) {
        vnode.properties.afterUpdate(domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children);
      }
    }
    vnode.domNode = previous.domNode;
  };

  // polyfill for window.performance
  var performance = (global.performance && global.performance.now ? global.performance : {
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
    lastProjector: null,
    createExecuted: function (timing1, timing2, timing3, projector) {
      stats.lastProjector = projector;
      stats.lastCreateVDom = timing2 - timing1;
      stats.lastCreateDom = timing3 - timing2;
    },
    updateExecuted: function (timing1, timing2, timing3, projector) {
      stats.lastProjector = projector;
      stats.lastUpdateVDom = timing2 - timing1;
      stats.lastUpdateDom = timing3 - timing2;
    }
  };

  var createProjection = function (vnode, projectionOptions) {
    return {
      update: function (updatedVnode) {
        if (vnode.vnodeSelector !== updatedVnode.vnodeSelector) {
          throw new Error("The selector for the root VNode may not be changed. (consider using mergeDom with one extra level)");
        }
        updateDom(vnode, updatedVnode, projectionOptions);
        vnode = updatedVnode;
      },
      domNode: vnode.domNode
    };
  };

  var maquette = {
    h: function (selector, properties, children) {
      if (!children &&
        (typeof properties === "string" || Array.isArray(properties) || (properties && properties.hasOwnProperty("vnodeSelector")))) {
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

    createDom: function (vnode, projectionOptions) {
      projectionOptions = applyDefaultProjectionOptions(projectionOptions);
      createDom(vnode, noop, projectionOptions);
      return createProjection(vnode, projectionOptions);
    },

    appendToDom: function (append, vnode, projectionOptions) {
      projectionOptions = applyDefaultProjectionOptions(projectionOptions);
      var afterCreate = append.appendChild ? function (newElement) {
        append.appendChild(newElement);
      } : append;
      createDom(vnode, afterCreate, projectionOptions);
      return createProjection(vnode, projectionOptions);
    },

    mergeDom: function (element, vnode, options) {
      options = applyDefaultProjectionOptions(options);
      vnode.domNode = element;
      initPropertiesAndChildren(element, vnode, options);
      return createProjection(vnode, options);
    },

    createProjector: function (element, renderFunction, projectionOptions) {
      projectionOptions = applyDefaultProjectionOptions(projectionOptions);
      projectionOptions.eventHandlerInterceptor = function (propertyName, functionPropertyArgument) {
        return function () {
          // intercept function calls (event handlers) to do a render afterwards.
          api.scheduleRender();
          return functionPropertyArgument.apply(this, arguments);
        };
      };
      var mount = null;
      var scheduled;
      var destroyed = false;
      var doRender = function () {
        scheduled = null;
        if (!mount) {
          var timing1 = performance.now();
          var vnode = renderFunction();
          var timing2 = performance.now();
          mount = maquette.mergeDom(element, vnode, projectionOptions);
          stats.createExecuted(timing1, timing2, performance.now(), api);
        } else {
          var updateTiming1 = performance.now();
          var updatedVnode = renderFunction();
          var updateTiming2 = performance.now();
          mount.update(updatedVnode);
          stats.updateExecuted(updateTiming1, updateTiming2, performance.now(), api);
        }
      };
      scheduled = requestAnimationFrame(doRender);
      var api = {
        scheduleRender: function () {
          if (!scheduled && !destroyed) {
            scheduled = requestAnimationFrame(doRender);
          }
        },
        destroy: function () {
          if (scheduled) {
            cancelAnimationFrame(scheduled);
            scheduled = null;
          }
          destroyed = true;
        }
      };
      return api;
    },

    createCache: function () {
      var cachedInputs = null;
      var cachedOutcome = null;
      var result = {
        invalidate: function () {
          cachedOutcome = null;
          cachedInputs = null;
        },
        result: function (inputs, calculation) {
          if (cachedInputs) {
            for (var i = 0; i < inputs.length; i++) {
              if (cachedInputs[i] !== inputs[i]) {
                cachedOutcome = null;
              }
            }
          }
          if (!cachedOutcome) {
            cachedOutcome = calculation();
            cachedInputs = inputs;
          }
          return cachedOutcome;
        }
      };
      return result;
    },

    stats: stats,
  };
  // Deprecated name for createProjector
  maquette.renderLoop = maquette.createProjector;

  if (typeof module !== "undefined" && module.exports) {
    // Node and other CommonJS-like environments that support module.exports
    module.exports = maquette;
  } else if (typeof define === "function" && define.amd) {
    // AMD / RequireJS
    define(function () {
      return maquette;
    });
  } else {
    // Browser
    window.maquette = maquette;
  }

})(this);
