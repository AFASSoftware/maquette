(function (global) {

  "use strict";

  // Utilities

  var emptyArray = [];

  var extend = function (base, overrides) {
    var result = {};
    Object.keys(base).forEach(function (key) {
      result[key] = base[key];
    });
    if(overrides) {
      Object.keys(overrides).forEach(function (key) {
        result[key] = overrides[key];
      });
    }
    return result;
  };

  // Hyperscript helper functions

  var flattenInto = function (parentSelector, insertions, main, mainIndex) {
    for(var i = 0; i < insertions.length; i++) {
      var item = insertions[i];
      if(Array.isArray(item)) {
        mainIndex = flattenInto(parentSelector, item, main, mainIndex);
      } else {
        if(item !== null && item !== undefined) {
          if(!item.hasOwnProperty("vnodeSelector")) {
            item = toTextVNode(item);
          }
          main.splice(mainIndex, 0, item);
          mainIndex++;
        }
      }
    }
    return mainIndex;
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
    if(children === null || children === undefined) {
      return undefined;
    }
    if(!Array.isArray(children)) {
      if(children.hasOwnProperty("vnodeSelector")) {
        return [children];
      } else {
        return [toTextVNode(children)];
      }
    }
    var index = 0;
    while(index < children.length) {
      var child = children[index];
      if(child === null || child === undefined) {
        children.splice(index, 1);
      } else if(Array.isArray(child)) {
        children.splice(index, 1);
        index = flattenInto(parentSelector, child, children, index);
      } else if(child.hasOwnProperty("vnodeSelector")) {
        index++;
      } else {
        children[index] = toTextVNode(child);
        index++;
      }
    }
    return children;
  };

  // Render helper functions
  
  var missingTransition = function() {
    throw new Error("Provide a transitions object to the projectionOptions to do animations");
  };

  var defaultProjectionOptions = {
    namespace: undefined,
    transitions: {
      enter: missingTransition,
      exit: missingTransition
    }
  };

  var applyDefaultProjectionOptions = function (projectionOptions) {
    return extend(defaultProjectionOptions, projectionOptions);
  };

  var setProperties = function (domNode, properties, projectionOptions) {
    if(!properties) {
      return;
    }
    var eventHandlerInterceptor = projectionOptions.eventHandlerInterceptor;
    for(var propName in properties) {
      var propValue = properties[propName];
      if(propName === "class" || propName === "className" || propName === "classList") {
        throw new Error("Property " + propName + " is not supported, use 'classes' instead.");
      } else if(propName === "classes") {
        // object with string keys and boolean values
        for(var className in propValue) {
          if(propValue[className]) {
            domNode.classList.add(className);
          }
        }
      } else if(propName === "styles") {
        // object with string keys and string (!) values
        for(var styleName in propValue) {
          var styleValue = propValue[styleName];
          if(styleValue) {
            if(typeof styleValue !== "string") {
              throw new Error("Style values may only be strings");
            }
            domNode.style[styleName] = styleValue;
          }
        }
      } else if(propName === "key") {
        continue;
      } else if(propValue === null || propValue === undefined) {
        continue;
      } else {
        var type = typeof propValue;
        if(type === "function") {
          if(eventHandlerInterceptor && (propName.lastIndexOf("on", 0) === 0)) { // lastIndexOf(,0)===0 -> startsWith
            propValue = eventHandlerInterceptor(propName, propValue, domNode, properties); // intercept eventhandlers
            if(propName === "oninput") {
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
        } else if(type === "string" && propName !== "value") {
          domNode.setAttribute(propName, propValue);
        } else {
          domNode[propName] = propValue;
        }
      }
    }
  };

  var updateProperties = function (domNode, previousProperties, properties, projectionOptions) {
    if(!properties) {
      return;
    }
    var propertiesUpdated = false;
    for(var propName in properties) {
      // assuming that properties will be nullified instead of missing is by design
      var propValue = properties[propName];
      var previousValue = previousProperties[propName];
      if(propName === "classes") {
        var classList = domNode.classList;
        for(var className in propValue) {
          var on = !!propValue[className];
          var previousOn = !!previousValue[className];
          if(on === previousOn) {
            continue;
          }
          propertiesUpdated = true;
          if(on) {
            classList.add(className);
          } else {
            classList.remove(className);
          }
        }
      } else if(propName === "styles") {
        for(var styleName in propValue) {
          var newStyleValue = propValue[styleName];
          var oldStyleValue = previousValue[styleName];
          if(newStyleValue === oldStyleValue) {
            continue;
          }
          propertiesUpdated = true;
          if(newStyleValue) {
            if(typeof newStyleValue !== "string") {
              throw new Error("Style values may only be strings");
            }
            domNode.style[styleName] = newStyleValue;
          } else {
            domNode.style[styleName] = "";
          }
        }
      } else {
        if(!propValue && typeof previousValue === "string") {
          propValue = "";
        }
        if(propName === "value") { // value can be manipulated by the user directly and using event.preventDefault() is not an option
          if(domNode[propName] !== propValue && domNode["oninput-value"] !== propValue) {
            domNode[propName] = propValue; // Reset the value, even if the virtual DOM did not change
          } // else do not update the domNode, otherwise the cursor position would be changed
          if(propValue !== previousValue) {
            propertiesUpdated = true;
          }
        } else if(propValue !== previousValue) {
          var type = typeof propValue;
          if(type === "function") {
            throw new Error("Functions may not be updated on subsequent renders (property: " + propName +
              "). Hint: declare event handler functions outside the render() function.");
          }
          if(type === "string") {
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
    if(!children) {
      return;
    }
    for(var i = 0; i < children.length; i++) {
      createDom(children[i], domNode, undefined, projectionOptions);
    }
  };

  var same = function (vnode1, vnode2) {
    if(vnode1.vnodeSelector !== vnode2.vnodeSelector) {
      return false;
    }
    if(vnode1.properties && vnode2.properties) {
      return vnode1.properties.key === vnode2.properties.key;
    }
    return !vnode1.properties && !vnode2.properties;
  };

  var findIndexOfChild = function (children, sameAs, start) {
    if(sameAs.vnodeSelector !== "") {
      // Never scan for text-nodes
      for(var i = start; i < children.length; i++) {
        if(same(children[i], sameAs)) {
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
        domNode.style.pointerEvents = "none";
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

  var checkDistinguishable = function(childNodes, indexToCheck, parentVNode, operation) {
    var childNode = childNodes[indexToCheck];
    if (childNode.vnodeSelector === "") {
      return; // Text nodes need not be distinguishable
    }
    var key = childNode.properties ? childNode.properties.key : undefined;
    if (!key) { // A key is just assumed to be unique
      for (var i = 0; i < childNodes.length; i++) {
        if (i !== indexToCheck) {
          var node = childNodes[i];
          if (same(node, childNode)) {
            if (operation === "added") {
              throw new Error(parentVNode.vnodeSelector + " had a " + childNode.vnodeSelector + " child " +
                "added, but there is now more than one. You must add unique key properties to make them distinguishable.");
            } else {
              throw new Error(parentVNode.vnodeSelector + " had a " + childNode.vnodeSelector + " child " +
                "removed, but there were more than one. You must add unique key properties to make them distinguishable.");
            }
          }
        }
      }
    }
  };

  var updateChildren = function (vnode, domNode, oldChildren, newChildren, projectionOptions) {
    if(oldChildren === newChildren) {
      return false;
    }
    oldChildren = oldChildren || emptyArray;
    newChildren = newChildren || emptyArray;
    var transitions = projectionOptions.transitions;

    var oldIndex = 0;
    var newIndex = 0;
    var i;
    var textUpdated = false;
    while(newIndex < newChildren.length) {
      var oldChild = (oldIndex < oldChildren.length) ? oldChildren[oldIndex] : undefined;
      var newChild = newChildren[newIndex];
      if(oldChild !== undefined && same(oldChild, newChild)) {
        textUpdated = updateDom(oldChild, newChild, projectionOptions) || textUpdated;
        oldIndex++;
      } else {
        var findOldIndex = findIndexOfChild(oldChildren, newChild, oldIndex + 1);
        if(findOldIndex >= 0) {
          // Remove preceding missing children
          for(i = oldIndex; i < findOldIndex; i++) {
            nodeToRemove(oldChildren[i], transitions);
            checkDistinguishable(oldChildren, i, vnode, "removed");
          }
          textUpdated = updateDom(oldChildren[findOldIndex], newChild, projectionOptions) || textUpdated;
          oldIndex = findOldIndex + 1;
        } else {
          // New child
          createDom(newChild, domNode, (oldIndex < oldChildren.length) ? oldChildren[oldIndex].domNode : undefined, projectionOptions);
          nodeAdded(newChild, transitions);
          checkDistinguishable(newChildren, newIndex, vnode, "added");
        }
      }
      newIndex++;
    }
    if(oldChildren.length > oldIndex) {
      // Remove child fragments
      for(i = oldIndex; i < oldChildren.length; i++) {
        nodeToRemove(oldChildren[i], transitions);
        checkDistinguishable(oldChildren, i, vnode, "removed");
      }
    }
    return textUpdated;
  };

  var createDom = function (vnode, parentNode, insertBefore, projectionOptions) {
    var domNode, i, c, start = 0, type, found;
    var vnodeSelector = vnode.vnodeSelector;
    if(vnodeSelector === "") {
      domNode = vnode.domNode = document.createTextNode(vnode.text);
      if(insertBefore !== undefined) {
        parentNode.insertBefore(domNode, insertBefore);
      } else {
        parentNode.appendChild(domNode);
      }
    } else {
      for (i = 0; i <= vnodeSelector.length; ++i) {
        c = vnodeSelector.charAt(i);
        if (i === vnodeSelector.length || c === '.' || c === '#') {
          type = vnodeSelector.charAt(start - 1);
          found = vnodeSelector.slice(start, i);
          if (type === ".") {
            domNode.classList.add(found);
          } else if (type === "#") {
            domNode.id = found;
          } else {
            if (found === "svg") {
              projectionOptions = extend(projectionOptions, { namespace: "http://www.w3.org/2000/svg" });
            }
            if (projectionOptions.namespace !== undefined) {
              domNode = vnode.domNode = document.createElementNS(projectionOptions.namespace, found);
            } else {
              domNode = vnode.domNode = document.createElement(found);
            }
            if (insertBefore !== undefined) {
              parentNode.insertBefore(domNode, insertBefore);
            } else {
              parentNode.appendChild(domNode);
            }
          }
          start = i + 1;
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
    if(vnode.properties && vnode.properties.afterCreate) {
      vnode.properties.afterCreate(domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children);
    }
  };

  var updateDom = function (previous, vnode, projectionOptions) {
    var domNode = previous.domNode;
    if(!domNode) {
      throw new Error("previous node was not rendered");
    }
    var textUpdated = false;
    if(previous === vnode) {
      return textUpdated; // we assume that nothing has changed
    }
    var updated = false;
    if(vnode.vnodeSelector === "") {
      if(vnode.text !== previous.text) {
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
      updated = updateChildren(vnode, domNode, previous.children, vnode.children, projectionOptions);
      updated = updateProperties(domNode, previous.properties, vnode.properties, projectionOptions) || updated;
      if(vnode.properties && vnode.properties.afterUpdate) {
        vnode.properties.afterUpdate(domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children);
      }
    }
    if(updated && vnode.properties && vnode.properties.updateAnimation) {
      vnode.properties.updateAnimation(domNode, vnode.properties, previous.properties);
    }
    vnode.domNode = previous.domNode;
    return textUpdated;
  };

  var createProjection = function (vnode, projectionOptions) {
    if(!vnode.vnodeSelector) {
      throw new Error("Invalid vnode argument");
    }
    return {
      update: function (updatedVnode) {
        if(vnode.vnodeSelector !== updatedVnode.vnodeSelector) {
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
      if(arguments.length === 2 && typeof selector === "string") {
        if(Array.isArray(properties)) {
          children = properties;
          properties = undefined;
        } else if(properties === undefined) {
          throw new Error("undefined is not a valid value for properties, maybe you forgot the comma between } and [ ?");
        }
      } else if(typeof selector !== "string" || (children && !Array.isArray(children)) || (properties !== undefined && typeof properties !== "object")) {
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
    
    // Simple low-level functions to manipulate the real DOM
    dom: {
      create: function (vnode, projectionOptions) {
        projectionOptions = applyDefaultProjectionOptions(projectionOptions);
        createDom(vnode, document.createElement("div"), undefined, projectionOptions);
        return createProjection(vnode, projectionOptions);
      },
  
      append: function (parentNode, vnode, projectionOptions) {
        projectionOptions = applyDefaultProjectionOptions(projectionOptions);
        createDom(vnode, parentNode, undefined, projectionOptions);
        return createProjection(vnode, projectionOptions);
      },
      
      insertBefore: function(beforeNode, vnode, projectionOptions) {
        projectionOptions = applyDefaultProjectionOptions(projectionOptions);
        createDom(vnode, beforeNode.parentNode, beforeNode, projectionOptions);
        return createProjection(vnode, projectionOptions);
      },
  
      merge: function (element, vnode, options) {
        options = applyDefaultProjectionOptions(options);
        vnode.domNode = element;
        initPropertiesAndChildren(element, vnode, options);
        return createProjection(vnode, options);
      }
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
          if(cachedInputs) {
            for(var i = 0; i < inputs.length; i++) {
              if(cachedInputs[i] !== inputs[i]) {
                cachedOutcome = undefined;
              }
            }
          }
          if(!cachedOutcome) {
            cachedOutcome = calculation();
            cachedInputs = inputs;
          }
          return cachedOutcome;
        }
      };
      return result;
    },
    
    createMapping: function(getSourceKey, createTarget, updateTarget /*, deleteTarget*/) {
      var keys = [];
      var results = [];
      
      return {
        results: results,
        map: function(newSources) {
          var newKeys = newSources.map(getSourceKey);
          var oldTargets = results.slice();
          var oldIndex = 0;
          for (var i=0;i<newSources.length;i++) {
            var source = newSources[i];
            var sourceKey = newKeys[i];
            if (sourceKey === keys[oldIndex]) {
              results[i] = oldTargets[oldIndex];
              updateTarget(source, oldTargets[oldIndex], i);
              oldIndex++;
            } else {
              var found = false;
              for (var j = 1; j < keys.length; j++) {
                var searchIndex = (oldIndex + j) % keys.length;
                if (keys[searchIndex] === sourceKey) {
                  results[i] = oldTargets[searchIndex];
                  updateTarget(newSources[i], oldTargets[searchIndex], i);
                  oldIndex = searchIndex + 1;
                  found = true;
                  break;
                }
              }
              if (!found) {
                results[i] = createTarget(source, i);
              }
            }
          }
          results.length = newSources.length;
          keys = newKeys;
        }
      };
    },

    createProjector: function (projectionOptions) {
      projectionOptions = applyDefaultProjectionOptions(projectionOptions);
      projectionOptions.eventHandlerInterceptor = function (propertyName, functionPropertyArgument) {
        return function () {
          // intercept function calls (event handlers) to do a render afterwards.
          projector.scheduleRender();
          return functionPropertyArgument.apply(this, arguments);
        };
      };
      var renderCompleted = true;
      var scheduled;
      var stopped = false;
      var projections = [];
      var renderFunctions = []; // matches the projections array

      var doRender = function () {
        scheduled = undefined;
        if (!renderCompleted) {
          return; // The last render threw an error, it should be logged in the browser console. 
        }
        renderCompleted = false;
        for(var i = 0; i < projections.length; i++) {
          var updatedVnode = renderFunctions[i]();
          projections[i].update(updatedVnode);
        }
        renderCompleted = true;
      };

      var projector = {
        scheduleRender: function () {
          if(!scheduled && !stopped) {
            scheduled = requestAnimationFrame(doRender);
          }
        },
        stop: function () {
          if(scheduled) {
            cancelAnimationFrame(scheduled);
            scheduled = undefined;
          }
          stopped = true;
        },
        resume: function() {
          stopped = false;
          renderCompleted = true;
          projector.scheduleRender();
        },
        evaluateHyperscript: function (rootNode, parameters) {
          var nodes = rootNode.querySelectorAll("script[type='text/hyperscript']");
          var functionParameters = ["maquette", "h", "enhancer"];
          var parameterValues = [maquette, maquette.h, projector];
          Object.keys(parameters).forEach(function (parameterName) {
            functionParameters.push(parameterName);
            parameterValues.push(parameters[parameterName]);
          });
          Array.prototype.forEach.call(nodes, function (node) {
            var func = new Function(functionParameters, "return " + node.textContent.trim());
            var renderFunction = function () {
              return func.apply(undefined, parameterValues);
            };
            projector.insertBefore(node, renderFunction);
          });
        },
        append: function (parentNode, renderMaquetteFunction) {
          projections.push(maquette.dom.append(parentNode, renderMaquetteFunction(), projectionOptions));
          renderFunctions.push(renderMaquetteFunction);
        },
        insertBefore: function (beforeNode, renderMaquetteFunction) {
          projections.push(maquette.dom.insertBefore(beforeNode, renderMaquetteFunction(), projectionOptions));
          renderFunctions.push(renderMaquetteFunction);
        },
        merge: function (domNode, renderMaquetteFunction) {
          projections.push(maquette.dom.merge(domNode, renderMaquetteFunction(), projectionOptions));
          renderFunctions.push(renderMaquetteFunction);
        },
        replace: function (domNode, renderMaquetteFunction) {
          var vnode = renderMaquetteFunction();
          createDom(vnode, domNode.parentNode, domNode, projectionOptions);
          domNode.parentNode.removeChild(domNode);
          projections.push(createProjection(vnode, projectionOptions));
          renderFunctions.push(renderMaquetteFunction);
        }
      };
      return projector;
    }
  };

  if(typeof module !== "undefined" && module.exports) {
    // Node and other CommonJS-like environments that support module.exports
    module.exports = maquette;
  } else if(typeof define === "function" && define.amd) {
    // AMD / RequireJS
    define(function () {
      return maquette;
    });
  } else {
    // Browser
    window.maquette = maquette;
  }

})(this);
