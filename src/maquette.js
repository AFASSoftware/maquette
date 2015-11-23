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

  var appendChildren = function (parentSelector, insertions, main) {
    for(var i = 0; i < insertions.length; i++) {
      var item = insertions[i];
      if(Array.isArray(item)) {
        appendChildren(parentSelector, item, main);
      } else {
        if(item !== null && item !== undefined) {
          if(!item.hasOwnProperty("vnodeSelector")) {
            item = toTextVNode(item);
          }
          main.push(item);
        }
      }
    }
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

  // Render helper functions
  
  var missingTransition = function() {
    throw new Error("Provide a transitions object to the projectionOptions to do animations");
  };

  var defaultProjectionOptions = {
    namespace: undefined,
    eventHandlerInterceptor: undefined,
    styleApplyer: function(domNode, styleName, value) {
      // Provides a hook to add vendor prefixes for browsers that still need it.
      domNode.style[styleName] = value;
    },
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
            projectionOptions.styleApplyer(domNode, styleName, styleValue);
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
            projectionOptions.styleApplyer(domNode, styleName, newStyleValue);
          } else {
            projectionOptions.styleApplyer(domNode, styleName, "");
          }
        }
      } else {
        if(!propValue && typeof previousValue === "string") {
          propValue = "";
        }
        if(propName === "value") { // value can be manipulated by the user directly and using event.preventDefault() is not an option
          if(domNode[propName] !== propValue && domNode["oninput-value"] !== propValue) {
            domNode[propName] = propValue; // Reset the value, even if the virtual DOM did not change
            domNode["oninput-value"] = undefined;
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
            if(domNode[propName] !== propValue) { // Comparison is here for side-effects in Edge with scrollLeft and scrollTop
              domNode[propName] = propValue;
            }
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

  /**
   * Represents a {@link VNode} tree that has been rendered to a real DOM tree.
   * @interface Projection
   */
  var createProjection = function (vnode, projectionOptions) {
    if(!vnode.vnodeSelector) {
      throw new Error("Invalid vnode argument");
    }
    return {
      /**
       * Updates the projection with the new virtual DOM tree.
       * @param {VNode} updatedVnode - The updated virtual DOM tree. Note: The selector for the root of the tree must remain constant. 
       * @memberof Projection#
       */
      update: function (updatedVnode) {
        if(vnode.vnodeSelector !== updatedVnode.vnodeSelector) {
          throw new Error("The selector for the root VNode may not be changed. (consider using dom.merge and add one extra level to the virtual DOM)");
        }
        updateDom(vnode, updatedVnode, projectionOptions);
        vnode = updatedVnode;
      },
      /**
       * The DOM node that is used as the root of this {@link Projection}.
       * @type {Element}
       * @memberof Projection#
       */
      domNode: vnode.domNode
    };
  };

  // Declaration of interfaces and callbacks, before the @exports maquette

  /**
   * A virtual representation of a DOM Node. Maquette assumes that {@link VNode} objects are never modified externally.
   * Instances of {@link VNode} can be created using {@link module:maquette.h}.
   * @interface VNode
   */

  /**
   * A CalculationCache object remembers the previous outcome of a calculation along with the inputs. 
   * On subsequent calls the previous outcome is returned if the inputs are identical. 
   * This object can be used to bypass both rendering and diffing of a virtual DOM subtree.
   * Instances of {@link CalculationCache} can be created using {@link module:maquette.createCache}.
   * @interface CalculationCache
   */

  /**
   * Keeps an array of result objects synchronized with an array of source objects.
   * Mapping provides a {@link Mapping#map} function that updates the {@link Mapping#results}. 
   * The {@link Mapping#map} function can be called multiple times and the results will get created, removed and updated accordingly.
   * A {@link Mapping} can be used to keep an array of components (objects with a `renderMaquette` method) synchronized with an array of data.
   * Instances of {@link Mapping} can be created using {@link module:maquette.createMapping}.
   * @interface Mapping
   */

  /**
   * Used to create and update the DOM.
   * Use {@link Projector#append}, {@link Projector#merge}, {@link Projector#insertBefore} and {@link Projector#replace} 
   * to create the DOM.
   * The `renderMaquetteFunction` callbacks will be called immediately to create the DOM. Afterwards, these functions 
   * will be called again to update the DOM on the next animation-frame after:
   * 
   *  - The {@link Projector#scheduleRender} function  was called
   *  - An event handler (like `onclick`) on a rendered {@link VNode} was called.
   * 
   * The projector stops when {@link Projector#stop} is called or when an error is thrown during rendering. 
   * It is possible to use `window.onerror` to handle these errors.
   * Instances of {@link Projector} can be created using {@link module:maquette.createProjector}.
   * @interface Projector
   */

  /**
   * @callback enterAnimationCallback
   * @param {Element} element - Element that was just added to the DOM.
   * @param {Object} properties - The properties object that was supplied to the {@link module:maquette.h} method
   */

  /**
   * @callback exitAnimationCallback
   * @param {Element} element - Element that ought to be removed from to the DOM.
   * @param {function} removeElement - Function that removes the element from the DOM. 
   * This argument is supplied purely for convenience. 
   * You may use this function to remove the element when the animation is done.
   * @param {Object} properties - The properties object that was supplied to the {@link module:maquette.h} method that rendered this {@link VNode} the previous time.
   */

  /**
   * @callback updateAnimationCallback
   * @param {Element} element - Element that was modified in the DOM.
   * @param {Object} properties - The last properties object that was supplied to the {@link module:maquette.h} method
   * @param {Object} previousProperties - The previous properties object that was supplied to the {@link module:maquette.h} method
   */
   
  /**
   * @callback afterCreateCallback
   * @param {Element} element - The element that was added to the DOM.
   * @param {Object} projectionOptions - The projection options that were used see {@link module:maquette.createProjector}.
   * @param {string} vnodeSelector - The selector passed to the {@link module:maquette.h} function.
   * @param {Object} properties - The properties passed to the {@link module:maquette.h} function.
   * @param {VNode[]} children - The children that were created.
   * @param {Object} properties - The last properties object that was supplied to the {@link module:maquette.h} method
   * @param {Object} previousProperties - The previous properties object that was supplied to the {@link module:maquette.h} method
   */

  /**
   * @callback afterUpdateCallback
   * @param {Element} element - The element that may have been updated in the DOM.
   * @param {Object} projectionOptions - The projection options that were used see {@link module:maquette.createProjector}.
   * @param {string} vnodeSelector - The selector passed to the {@link module:maquette.h} function.
   * @param {Object} properties - The properties passed to the {@link module:maquette.h} function.
   * @param {VNode[]} children - The children for this node.
   */
   
  /**
   * Contains simple low-level utility functions to manipulate the real DOM. The singleton instance is available under {@link module:maquette.dom}.
   * @interface MaquetteDom
   */
   
  /**
   * The main object in maquette is the maquette object. 
   * It is either bound to `window.maquette` or it can be obtained using {@link http://browserify.org/|browserify} or {@link http://requirejs.org/|requirejs}.
   * @exports maquette
   */
  var maquette = {
    
    /**
     * The `h` method is used to create a virtual DOM node. 
     * This function is largely inspired by the mercuryjs and mithril frameworks.
     * The `h` stands for (virtual) hyperscript.
     * 
     * @param {string} selector - Contains the tagName, id and fixed css classnames in CSS selector format. 
     * It is formatted as follows: `tagname.cssclass1.cssclass2#id`. 
     * @param {Object} [properties] - An object literal containing properties that will be placed on the DOM node.
     * @param {function} properties.<b>*</b> - Properties with functions values like `onclick:handleClick` are registered as event handlers
     * @param {String} properties.<b>*</b> - Properties with string values, like `href:"/"` are used as attributes
     * @param {object} properties.<b>*</b> - All non-string values are put on the DOM node as properties
     * @param {Object} properties.key - Used to uniquely identify a DOM node among siblings. 
     * A key is required when there are more children with the same selector and these children are added or removed dynamically.
     * @param {Object} properties.classes - An object literal like `{important:true}` which allows css classes, like `important` to be added and removed dynamically.
     * @param {Object} properties.styles - An object literal like `{height:"100px"}` which allows styles to be changed dynamically. All values must be strings.
     * @param {(string|enterAnimationCallback)} properties.enterAnimation - The animation to perform when this node is added to an already existing parent. 
     * {@link http://maquettejs.org/docs/animations.html|More about animations}.
     * When this value is a string, you must pass a `projectionOptions.transitions` object when creating the projector {@link module:maquette.createProjector}. 
     * @param {(string|exitAnimationCallback)} properties.exitAnimation - The animation to perform when this node is removed while its parent remains.
     * When this value is a string, you must pass a `projectionOptions.transitions` object when creating the projector {@link module:maquette.createProjector}. 
     * {@link http://maquettejs.org/docs/animations.html|More about animations}.
     * @param {updateAnimationCallback} properties.updateAnimation - The animation to perform when the properties of this node change. 
     * This also includes attributes, styles, css classes. This callback is also invoked when node contains only text and that text changes.
     * {@link http://maquettejs.org/docs/animations.html|More about animations}.
     * @param {afterCreateCallback} properties.afterCreate - Callback that is executed after this node is added to the DOM. Childnodes and properties have already been applied.
     * @param {afterUpdateCallback} properties.afterUpdate - Callback that is executed every time this node may have been updated. Childnodes and properties have already been updated. 
     * @param {Object[]} [children] - An array of virtual DOM nodes to add as child nodes. 
     * This array may contain nested arrays, `null` or `undefined` values.
     * Nested arrays are flattened, `null` and `undefined` will be skipped.
     * 
     * @returns {VNode} A VNode object, used to render a real DOM later. NOTE: There are {@link http://maquettejs.org/docs/rules.html|three basic rules} you should be aware of when updating the virtual DOM.
     */
    h: function (selector, properties, childrenArgs) {
      if (typeof selector !== "string") {
        throw new Error();
      }
      var childIndex = 1;
      if (properties && !properties.hasOwnProperty("vnodeSelector") && !Array.isArray(properties) && typeof properties === "object") {
        childIndex = 2;
      } else {
        // Optional properties argument was omitted
        properties = undefined;
      }
      var text = undefined;
      var children = undefined;
      var argsLength = arguments.length;
      // Recognize a common special case where there is only a single text node
      if(argsLength === childIndex + 1) {
        var onlyChild = arguments[childIndex];
        if (typeof onlyChild === "string") {
          text = onlyChild;
        } else if (onlyChild.length === 1 && typeof onlyChild[0] === "string") {
          text = onlyChild[0];
        }
      } 
      if (text === undefined) {
        children = [];
        for (;childIndex<arguments.length;childIndex++) {
          var child = arguments[childIndex];
          if(child === null || child === undefined) {
            continue;
          } else if(Array.isArray(child)) {
            appendChildren(selector, child, children);
          } else if(child.hasOwnProperty("vnodeSelector")) {
            children.push(child);
          } else {
            children.push(toTextVNode(child));
          }
        }
      }
      return {
        /** 
         * The CSS selector containing tagname, css classnames and id. An empty string is used to denote a text node. 
         * @memberof VNode# 
         */
        vnodeSelector: selector,
        /** 
         * Object containing attributes, properties, event handlers and more @see module:maquette.h 
         * @memberof VNode# 
         */
        properties: properties,
        /** 
         * Array of VNodes to be used as children. This array is already flattened. 
         * @memberof VNode# 
         */
        children: children,
        /**
         * Used in a special case when a VNode only has one childnode which is a textnode. Only used in combination with children === undefined.
         * @memberof VNode# 
         */
        text: text,
        /**
         * Used by maquette to store the domNode that was produced from this {@link VNode}.
         * @memberof VNode# 
         */
        domNode: null
      };
    },
    
    /**
     * @type MaquetteDom
     */
    dom: {
      /**
       * Creates a real DOM tree from a {@link VNode}. The {@link Projection} object returned will contain the resulting DOM Node under the {@link Projection#domNode} property. 
       * This is a low-level method. Users wil typically use a {@link Projector} instead. 
       * @memberof MaquetteDom#
       * @param {VNode} vnode - The root of the virtual DOM tree that was created using the {@link module:maquette.h} function. NOTE: {@link VNode} objects may only be rendered once.
       * @param {Object} projectionOptions - Options to be used to create and update the projection, see {@link module:maquette.createProjector}. 
       * @returns {Projection} The {@link Projection} which contains the DOM Node that was created.
       */
      create: function (vnode, projectionOptions) {
        projectionOptions = applyDefaultProjectionOptions(projectionOptions);
        createDom(vnode, document.createElement("div"), undefined, projectionOptions);
        return createProjection(vnode, projectionOptions);
      },
  
      /**
       * Appends a new childnode to the DOM which is generated from a {@link VNode}. 
       * This is a low-level method. Users wil typically use a {@link Projector} instead. 
       * @memberof MaquetteDom#
       * @param {Element} parentNode - The parent node for the new childNode.
       * @param {VNode} vnode - The root of the virtual DOM tree that was created using the {@link module:maquette.h} function. NOTE: {@link VNode} objects may only be rendered once.
       * @param {Object} projectionOptions - Options to be used to create and update the projection, see {@link module:maquette.createProjector}. 
       * @returns {Projection} The {@link Projection} that was created.
       */
      append: function (parentNode, vnode, projectionOptions) {
        projectionOptions = applyDefaultProjectionOptions(projectionOptions);
        createDom(vnode, parentNode, undefined, projectionOptions);
        return createProjection(vnode, projectionOptions);
      },
      
      /**
       * Inserts a new DOM node which is generated from a {@link VNode}. 
       * This is a low-level method. Users wil typically use a {@link Projector} instead. 
       * @memberof MaquetteDom#
       * @param {Element} beforeNode - The node that the DOM Node is inserted before.
       * @param {VNode} vnode - The root of the virtual DOM tree that was created using the {@link module:maquette.h} function. NOTE: {@link VNode} objects may only be rendered once.
       * @param {Object} projectionOptions - Options to be used to create and update the projection, see {@link module:maquette.createProjector}. 
       * @returns {Projection} The {@link Projection} that was created.
       */
      insertBefore: function(beforeNode, vnode, projectionOptions) {
        projectionOptions = applyDefaultProjectionOptions(projectionOptions);
        createDom(vnode, beforeNode.parentNode, beforeNode, projectionOptions);
        return createProjection(vnode, projectionOptions);
      },
  
      /**
       * Merges a new DOM node which is generated from a {@link VNode} with an existing DOM Node.
       * This means that the virtual DOM and real DOM have one overlapping element. 
       * Therefore the selector for the root {@link VNode} will be ignored, but its properties and children will be applied to the Element provided 
       * This is a low-level method. Users wil typically use a {@link Projector} instead. 
       * @memberof MaquetteDom#
       * @param {Element} domNode - The existing element to adopt as the root of the new virtual DOM. Existing attributes and childnodes are preserved.  
       * @param {VNode} vnode - The root of the virtual DOM tree that was created using the {@link module:maquette.h} function. NOTE: {@link VNode} objects may only be rendered once.
       * @param {Object} projectionOptions - Options to be used to create and update the projection, see {@link module:maquette.createProjector}. 
       * @returns {Projection} The {@link Projection} that was created.
       */
      merge: function (element, vnode, options) {
        options = applyDefaultProjectionOptions(options);
        vnode.domNode = element;
        initPropertiesAndChildren(element, vnode, options);
        return createProjection(vnode, options);
      }
    },

    /**
     * Creates a {@link CalculationCache} object, useful for caching {@link VNode} trees. 
     * In practice, caching of {@link VNode} trees is not needed, because achieving 60 frames per second is almost never a problem.
     * @returns {CalculationCache}
     */
    createCache: function () {
      var cachedInputs = undefined;
      var cachedOutcome = undefined;
      var result = {
        /**
         * Manually invalidates the cached outcome.
         * @memberof CalculationCache#
         */
        invalidate: function () {
          cachedOutcome = undefined;
          cachedInputs = undefined;
        },
        /**
         * If the inputs array matches the inputs array from the previous invocation, this method returns the result of the previous invocation.
         * Otherwise, the calculation function is invoked and its result is cached and returned. 
         * Objects in the inputs array are compared using ===.
         * @param {Object[]} inputs - Array of objects that are to be compared using === with the inputs from the previous invocation. 
         * These objects are assumed to be immutable primitive values.
         * @param {function} calculation - Function that takes zero arguments and returns an object (A {@link VNode} assumably) that can be cached.
         * @memberof CalculationCache#
         */
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
    
    /**
     * Creates a {@link Mapping} instance that keeps an array of result objects synchronized with an array of source objects.
     * @param {function} getSourceKey - `function(source)` that must return a key to identify each source object. The result must eather be a string or a number.
     * @param {function} createResult - `function(source, index)` that must create a new result object from a given source. This function is identical argument of `Array.map`.
     * @param {function} updateResult - `function(source, target, index)` that updates a result to an updated source.
     * @returns {Mapping} 
     */
    createMapping: function(getSourceKey, createResult, updateResult /*, deleteTarget*/) {
      var keys = [];
      var results = [];
      
      return {
        /**
         * The array of results. These results will be synchronized with the latest array of sources that were provided using {@link Mapping#map}.
         * @type {Object[]}
         * @memberof Mapping#
         */
        results: results,
        /**
         * Maps a new array of sources and updates {@link Mapping#results}.
         * @param {Object[]} newSources - The new array of sources.
         * @memberof Mapping#
         */
        map: function(newSources) {
          var newKeys = newSources.map(getSourceKey);
          var oldTargets = results.slice();
          var oldIndex = 0;
          for (var i=0;i<newSources.length;i++) {
            var source = newSources[i];
            var sourceKey = newKeys[i];
            if (sourceKey === keys[oldIndex]) {
              results[i] = oldTargets[oldIndex];
              updateResult(source, oldTargets[oldIndex], i);
              oldIndex++;
            } else {
              var found = false;
              for (var j = 1; j < keys.length; j++) {
                var searchIndex = (oldIndex + j) % keys.length;
                if (keys[searchIndex] === sourceKey) {
                  results[i] = oldTargets[searchIndex];
                  updateResult(newSources[i], oldTargets[searchIndex], i);
                  oldIndex = searchIndex + 1;
                  found = true;
                  break;
                }
              }
              if (!found) {
                results[i] = createResult(source, i);
              }
            }
          }
          results.length = newSources.length;
          keys = newKeys;
        }
      };
    },

    /**
     * Creates a {@link Projector} instance using the provided projectionOptions.
     * @param {Object} [projectionOptions] - Options that influence how the DOM is rendered and updated.
     * @param {Object} projectionOptions.transitions - A transition strategy to invoke when 
     * enterAnimation and exitAnimation properties are provided as strings.
     * The module `cssTransitions` in the provided `css-transitions.js` file provides such a strategy. 
     * A transition strategy is not needed when enterAnimation and exitAnimation properties are provided as functions.
     * @returns {Projector}
     */
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
        /**
         * Instructs the projector to re-render to the DOM at the next animation-frame using the registered `renderMaquette` functions.
         * This method is automatically called for you when event-handlers that are registered in the {@link VNode}s are invoked.
         * You need to call this method for instance when timeouts expire or AJAX responses arrive.
         * @memberof Projector#
         */
        scheduleRender: function () {
          if(!scheduled && !stopped) {
            scheduled = requestAnimationFrame(doRender);
          }
        },
        /**
         * Stops the projector. This means that the registered `renderMaquette` functions will not be called anymore.
         * Note that calling {@link Projector#stop} is not mandatory. A projector is a passive object that will get garbage collected as usual if it is no longer in scope.
         * @memberof Projector#
         */
        stop: function () {
          if(scheduled) {
            cancelAnimationFrame(scheduled);
            scheduled = undefined;
          }
          stopped = true;
        },
        /**
         * Resumes the projector. Use this method to resume rendering after stop was called or an error occurred during rendering.
         * @memberof Projector#
         */
        resume: function() {
          stopped = false;
          renderCompleted = true;
          projector.scheduleRender();
        },
        /**
         * Scans the document for `<script>` tags with `type="text/hyperscript"`.
         * The content of these scripts are registered as `renderMaquette` functions.
         * The result of evaluating these functions will be inserted into the DOM after the script.
         * These scripts can make use of variables that come from the `parameters` parameter.
         * @param {Element} rootNode - Element to start scanning at, example: `document.body`.
         * @param {Object} parameters - Variables to expose to the scripts. format: `{var1:value1, var2: value2}`
         * @memberof Projector#
         */
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
        /**
         * Appends a new childnode to the DOM using the result from the provided `renderMaquetteFunction`.
         * The `renderMaquetteFunction` will be invoked again to update the DOM when needed.
         * @param {Element} parentNode - The parent node for the new childNode.
         * @param {function} renderMaquetteFunction - Function with zero arguments that returns a {@link VNode} tree.
         * @memberof Projector#
         */
        append: function (parentNode, renderMaquetteFunction) {
          projections.push(maquette.dom.append(parentNode, renderMaquetteFunction(), projectionOptions));
          renderFunctions.push(renderMaquetteFunction);
        },
        /**
         * Inserts a new DOM node using the result from the provided `renderMaquetteFunction`.
         * The `renderMaquetteFunction` will be invoked again to update the DOM when needed.
         * @param {Element} beforeNode - The node that the DOM Node is inserted before.
         * @param {function} renderMaquetteFunction - Function with zero arguments that returns a {@link VNode} tree.
         * @memberof Projector#
         */
        insertBefore: function (beforeNode, renderMaquetteFunction) {
          projections.push(maquette.dom.insertBefore(beforeNode, renderMaquetteFunction(), projectionOptions));
          renderFunctions.push(renderMaquetteFunction);
        },
        /**
         * Merges a new DOM node using the result from the provided `renderMaquetteFunction` with an existing DOM Node.
         * This means that the virtual DOM and real DOM have one overlapping element. 
         * Therefore the selector for the root {@link VNode} will be ignored, but its properties and children will be applied to the Element provided
         * The `renderMaquetteFunction` will be invoked again to update the DOM when needed.
         * @param {Element} domNode - The existing element to adopt as the root of the new virtual DOM. Existing attributes and childnodes are preserved.  
         * @param {function} renderMaquetteFunction - Function with zero arguments that returns a {@link VNode} tree.
         * @memberof Projector#
         */
        merge: function (domNode, renderMaquetteFunction) {
          projections.push(maquette.dom.merge(domNode, renderMaquetteFunction(), projectionOptions));
          renderFunctions.push(renderMaquetteFunction);
        },
        /**
         * Replaces an existing DOM node with the result from the provided `renderMaquetteFunction`.
         * The `renderMaquetteFunction` will be invoked again to update the DOM when needed.
         * @param {Element} domNode - The DOM node to replace.
         * @param {function} renderMaquetteFunction - Function with zero arguments that returns a {@link VNode} tree.
         * @memberof Projector#
         */
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

