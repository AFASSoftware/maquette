(function (global) {

  "use strict";

  // Utilities

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
    var selector = sameAs.vnodeSelector;
    if (selector === "") {
      return; // textnodes can be safely ignored.
    }
    if (sameAs.properties && sameAs.properties.key) {
      return; // uniqueness of keys is not checked for performance sake
    }
    for (var i = 0; i < selectorsThusFar.length; i++) {
      if (selector === selectorsThusFar[i]) {
        throw new Error("[" + parentSelector + "] contains indistinguishable child nodes [" + selector + "], please add unique key properties.");
      }
    }
    selectorsThusFar.push(selector);
  };

  var toTextVNode = function (data) {
    return {
      vnodeSelector: "",
      properties: undefined,
      children: undefined,
      text: (data === null || data === undefined) ? "" : data.toString(),
      domNode: null
    };
  };

  // removes nulls, flattens embedded arrays
  var flatten = function (parentSelector, children) {
    if (children === null || children === undefined) {
      return undefined;
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

  var defaultProjectionOptions = {
    namespace: undefined,
    transitions: {
      enter: function () {
        throw new Error("Provide a transitions object to the projectionOptions to do animations");
      },
      exit: function () {
        throw new Error("Provide a transitions object to the projectionOptions to do animations");
      }
    }
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
        throw new Error("Property " + className + " is not supported, use 'classes' instead.");
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
                var oldPropValue = propValue;
                propValue = function (evt) {
                  evt.target["oninput-value"] = evt.target.value;
                  oldPropValue.apply(this, [evt]);
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
    var propertiesUpdated = false;
    for (var propName in properties) {
      // assuming that properties will be nullified instead of missing is by design
      var propValue = properties[propName];
      var previousValue = previousProperties[propName];
      if (propName === "classes") {
        var classList = domNode.classList;
        for (var className in propValue) {
          var on = !!propValue[className];
          var previousOn = !!previousValue[className];
          if (on === previousOn) {
            continue;
          }
          propertiesUpdated = true;
          if (on) {
            classList.add(className);
          } else {
            classList.remove(className);
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
          if(propValue !== previousValue) {
            propertiesUpdated = true;
          }
        } else if (propValue !== previousValue) {
          var type = typeof propValue;
          if (type === "function") {
            throw new Error("Functions may not be updated on subsequent renders (property: " + propName +
              "). Hint: declare event handler functions outside the render() function.");
          }
          if (type === "string") {
            domNode.setAttribute(propName, propValue);
          } else {
            domNode[propName] = propValue;
          }
          propertiesUpdated = true;
        }
      }
    }
    return propertiesUpdated;
  };

  var addChildren = function (domNode, children, projectionOptions) {
    if (!children) {
      return;
    }
    for(var i = 0; i < children.length; i++) {
      createDom(children[i], domNode, undefined, projectionOptions);
    }
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

  var nodeAdded = function (vNode, transitions) {
    if(vNode.properties) {
      var enterAnimation = vNode.properties.enterAnimation;
      if(enterAnimation) {
        if(typeof enterAnimation === "function") {
          enterAnimation(vNode.domNode, vNode.properties);
        } else {
          transitions.enter(vNode.domNode, vNode.properties, enterAnimation);
        }
      }
    }
  };

  var nodeToRemove = function (vNode, transitions) {
    var domNode = vNode.domNode;
    if(vNode.properties) {
      var exitAnimation = vNode.properties.exitAnimation;
      if(exitAnimation) {
        var removeDomNode = function () {
          if(domNode.parentNode) {
            domNode.parentNode.removeChild(domNode);
          }
        };
        if(typeof exitAnimation === "function") {
          exitAnimation(domNode, removeDomNode, vNode.properties);
          return;
        } else {
          transitions.exit(vNode.domNode, vNode.properties, exitAnimation, removeDomNode);
          return;
        }
      }
    }
    if(domNode.parentNode) {
      domNode.parentNode.removeChild(domNode);
    }
  };

  var updateChildren = function (domNode, oldChildren, newChildren, projectionOptions) {
    if (oldChildren === newChildren) {
      return false;
    }
    oldChildren = oldChildren || emptyArray;
    newChildren = newChildren || emptyArray;
    var transitions = projectionOptions.transitions;

    var oldIndex = 0;
    var newIndex = 0;
    var i;
    var textUpdated = false;
    while (newIndex < newChildren.length) {
      var oldChild = (oldIndex < oldChildren.length) ? oldChildren[oldIndex] : undefined;
      var newChild = newChildren[newIndex];
      if (oldChild !== undefined && same(oldChild, newChild)) {
        textUpdated = updateDom(oldChild, newChild, projectionOptions) || textUpdated;
        oldIndex++;
      } else {
        var findOldIndex = findIndexOfChild(oldChildren, newChild, oldIndex + 1);
        if (findOldIndex >= 0) {
          // Remove preceding missing children
          for(i = oldIndex; i < findOldIndex; i++) {
            nodeToRemove(oldChildren[i], transitions);
          }
          textUpdated = updateDom(oldChildren[findOldIndex], newChild, projectionOptions) || textUpdated;
          oldIndex = findOldIndex + 1;
        } else {
          // New child
          createDom(newChild, domNode, (oldIndex < oldChildren.length) ? oldChildren[oldIndex].domNode : undefined, projectionOptions);
          nodeAdded(newChild, transitions);
        }
      }
      newIndex++;
    }
    if (oldChildren.length > oldIndex) {
      // Remove child fragments
      for(i = oldIndex; i < oldChildren.length; i++) {
        nodeToRemove(oldChildren[i], transitions);
      }
    }
    return textUpdated;
  };

  var createDom = function (vnode, parentNode, insertBefore, projectionOptions) {
    var domNode, i;
    var vnodeSelector = vnode.vnodeSelector;
    if(vnodeSelector === "") {
      domNode = vnode.domNode = document.createTextNode(vnode.text);
      if(insertBefore !== undefined) {
        parentNode.insertBefore(domNode, insertBefore);
      } else {
        parentNode.appendChild(domNode);
      }
    } else {
      // parsing the selector
      var lastStart = 0;
      var mode;
      var nextMode = "tag";
      var found = undefined;
      var length = vnodeSelector.length;
      for(i = 0; i < length; i++) {
        mode = nextMode;
        if(i === length - 1) {
          found = lastStart === 0 ? vnodeSelector : vnodeSelector.substr(lastStart);
        } else {
          var c = vnodeSelector.charAt(i);
          if(c === ".") {
            nextMode = "class";
            found = vnodeSelector.substring(lastStart, i);
            lastStart = i + 1;
          } else if(c === "#") {
            nextMode = "id";
            found = vnodeSelector.substring(lastStart, i);
            lastStart = i + 1;
          }
        }
        if(found !== undefined) {
          if(mode === "tag") {
            if(found === "svg") {
              projectionOptions = extend(projectionOptions, { namespace: "http://www.w3.org/2000/svg" });
            }
            if(projectionOptions.namespace !== undefined) {
              domNode = vnode.domNode = document.createElementNS(projectionOptions.namespace, found);
            } else {
              domNode = vnode.domNode = document.createElement(found);
            }
            if(insertBefore !== undefined) {
              parentNode.insertBefore(domNode, insertBefore);
            } else {
              parentNode.appendChild(domNode);
            }
          } else if(mode === "class") {
            domNode.classList.add(found);
          } else {
            domNode.id = found;
          }
          found = undefined;
        }
      }
      initPropertiesAndChildren(domNode, vnode, projectionOptions);
    }
  };

  var initPropertiesAndChildren = function (domNode, vnode, projectionOptions) {
    addChildren(domNode, vnode.children, projectionOptions); // children before properties, needed for value property of <select>.
    if(vnode.text) {
      domNode.textContent = vnode.text;
    }
    setProperties(domNode, vnode.properties, projectionOptions);
    if (vnode.properties && vnode.properties.afterCreate) {
      vnode.properties.afterCreate(domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children);
    }
  };

  var updateDom = function (previous, vnode, projectionOptions) {
    var domNode = previous.domNode;
    if (!domNode) {
      throw new Error("previous node was not mounted");
    }
    var textUpdated = false;
    if(previous === vnode) {
      return textUpdated; // we assume that nothing has changed
    }
    var updated = false;
    if (vnode.vnodeSelector === "") {
      if (vnode.text !== previous.text) {
        domNode.nodeValue = vnode.text;
        textUpdated = true;
      }
    } else {
      if(vnode.vnodeSelector.substr(0, 3) === "svg") {
        projectionOptions = extend(projectionOptions, { namespace: "http://www.w3.org/2000/svg" });
      }
      if(previous.text !== vnode.text) {
        textUpdated = true;
        if(vnode.text === undefined) {
          domNode.removeChild(domNode.firstChild); // the only textnode presumably
        } else {
          domNode.textContent = vnode.text;
        }
      }
      updated = updateChildren(domNode, previous.children, vnode.children, projectionOptions);
      updated = updateProperties(domNode, previous.properties, vnode.properties, projectionOptions) || updated;
      if (vnode.properties && vnode.properties.afterUpdate) {
        vnode.properties.afterUpdate(domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children);
      }
    }
    if(updated && vnode.properties && vnode.properties.updateAnimation) {
      vnode.properties.updateAnimation(domNode, vnode.properties, previous.properties);
    }
    vnode.domNode = previous.domNode;
    return textUpdated;
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
      if (!children && (Array.isArray(properties)) && typeof selector === "string") {
        children = properties;
        properties = undefined;
      } else if (typeof selector !== "string" || (children && !Array.isArray(children)) || (properties !== undefined && typeof properties !== "object")) {
        throw new Error("Incorrect arguments passed to the h() function. Correct signature: h(string, optional object, optional array)");
      }
      var text = undefined;
      if(children && children.length === 1 && typeof children[0] === "string") {
        text = children[0];
        children = undefined;
      } else {
        children = flatten(selector, children);
      }
      return {
        vnodeSelector: selector,
        properties: properties,
        children: children,
        text: text, // Only used in combination with children === undefined
        domNode: null
      };
    },

    createDom: function (vnode, projectionOptions) {
      projectionOptions = applyDefaultProjectionOptions(projectionOptions);
      createDom(vnode, document.createElement("div"), undefined, projectionOptions);
      return createProjection(vnode, projectionOptions);
    },

    appendToDom: function (parentNode, vnode, projectionOptions) {
      projectionOptions = applyDefaultProjectionOptions(projectionOptions);
      createDom(vnode, parentNode, undefined, projectionOptions);
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
      var mount = undefined;
      var scheduled;
      var destroyed = false;
      var doRender = function () {
        scheduled = undefined;
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
            scheduled = undefined;
          }
          destroyed = true;
        }
      };
      return api;
    },

    createCache: function () {
      var cachedInputs = undefined;
      var cachedOutcome = undefined;
      var result = {
        invalidate: function () {
          cachedOutcome = undefined;
          cachedInputs = undefined;
        },
        result: function (inputs, calculation) {
          if (cachedInputs) {
            for (var i = 0; i < inputs.length; i++) {
              if (cachedInputs[i] !== inputs[i]) {
                cachedOutcome = undefined;
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
