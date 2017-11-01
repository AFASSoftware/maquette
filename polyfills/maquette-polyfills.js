(function (global) {

  "use strict";

  // Test if 'Object.defineProperty' can be used (IE8 has wrong implementation)
  var object_defineProperty = true;
  try
  {
    Object.defineProperty({}, "x", {});
  }
  catch(e)
  {
    object_defineProperty = false;
  }

  // polyfill for window.requestAnimationFrame
  (function ()
  {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !global.requestAnimationFrame; ++x)
    {
      global.requestAnimationFrame = global[vendors[x] + 'RequestAnimationFrame'];
      global.cancelAnimationFrame = global[vendors[x] + 'CancelAnimationFrame'] || global[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if(!global.requestAnimationFrame || /iP(ad|hone|od).*OS 6/.test(global.navigator.userAgent)) // Buggy iOS6
      global.requestAnimationFrame = function (callback, element)
      {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = global.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };

    if(!global.cancelAnimationFrame)
      global.cancelAnimationFrame = function (id)
      {
        clearTimeout(id);
      };
  }());

  // polyfill for Array.isArray
  if(!Array.isArray) {
    Array.isArray = function (arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }

  // Polyfill for textContent
  if(!("textContent" in document.documentElement)) {

    (function (createElement) {

      var onPropertyChange = function (e) {

        if(e.propertyName === "textContent") {
          e.srcElement.innerText = e.srcElement.textContent;
        }
      };

      document.createElement = function (tagName) {
        var element = createElement(tagName);
        element.textContent = "";
        element.attachEvent("onpropertychange", onPropertyChange);
        return element;
      };

    })(document.createElement);
  }

  // polyfill for classList
  if(!("classList" in document.documentElement))
  {
    (function (join, splice, createElement)
    {
      if(object_defineProperty)
      {
        var DOMEx = function (type, message)
        {
          this.name = type;
          this.code = DOMException[type];
          this.message = message;
        };

        var strTrim = String.prototype.trim || function ()
        {
          return this.replace(/^\s+|\s+$/g, "");
        };

        var arrIndexOf = Array.prototype.indexOf || function (item)
        {
          var i = 0;
          var len = this.length;

          for(; i < len; i++)
          {
            if(i in this && this[i] === item)
            {
              return i;
            }
          }

          return -1;
        };

        var checkTokenAndGetIndex = function (classList, token)
        {
          if(token === "")
          {
            throw new DOMEx("SYNTAX_ERR", "An invalid or illegal string was specified");
          }

          if(/\s/.test(token))
          {
            throw new DOMEx("INVALID_CHARACTER_ERR", "String contains an invalid character");
          }

          return arrIndexOf.call(classList, token);
        };

        var classListObject = function (elem)
        {
          var trimmedClasses = strTrim.call(elem.getAttribute("class") || "");
          var classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [];
          var i = 0;
          var len = classes.length;

          for(; i < len; i++)
          {
            this.push(classes[i]);
          }

          this._updateClassName = function ()
          {
            elem.setAttribute("class", this.toString());
          };
        };

        var classListProto = classListObject.prototype = [];

        classListProto.item = function (i)
        {
          return this[i] || null;
        };

        classListProto.contains = function (token)
        {
          token += "";
          return checkTokenAndGetIndex(this, token) !== -1;
        };

        classListProto.add = function ()
        {
          var tokens = arguments;
          var i = 0;
          var l = tokens.length;
          var token;
          var updated = false;

          do
          {
            token = tokens[i] + "";
            if(checkTokenAndGetIndex(this, token) === -1)
            {
              this.push(token);
              updated = true;
            }
          }
          while(++i < l);

          if(updated)
          {
            this._updateClassName();
          }
        };

        classListProto.remove = function ()
        {
          var tokens = arguments;
          var i = 0;
          var l = tokens.length;
          var token;
          var updated = false;
          var index;

          do
          {
            token = tokens[i] + "";
            index = checkTokenAndGetIndex(this, token);
            while(index !== -1)
            {
              this.splice(index, 1);
              updated = true;
              index = checkTokenAndGetIndex(this, token);
            }
          }
          while(++i < l);

          if(updated)
          {
            this._updateClassName();
          }
        };

        classListProto.toggle = function (token, force)
        {
          token += "";

          var result = this.contains(token);
          var method = result
            ? force !== true && "remove"
            : force !== false && "add";

          if(method)
          {
            this[method](token);
          }

          if(force === true || force === false)
          {
            return force;
          }
          else
          {
            return !result;
          }
        };

        classListProto.toString = function ()
        {
          return this.join(" ");
        };

        var classListGetter = function ()
        {
          return new classListObject(this);
        };

        Object.defineProperty(global.Element.prototype, "classList", {
          get: classListGetter,
          enumerable: true,
          configurable: true
        });
      }
      else
      {
        var tokenize = function (token)
        {
          if(/^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/.test(token))
          {
            return String(token);
          }
          else
          {
            throw new Error('InvalidCharacterError: DOM Exception 5');
          }
        };

        var toObject = function (self)
        {
          for(var index = -1, object = {}, element; element = self[++index];)
          {
            object[element] = true;
          }

          return object;
        };

        var fromObject = function (self, object)
        {
          var array = [], token;

          for(token in object)
          {
            if(object[token])
            {
              array.push(token);
            }
          }

          splice.apply(self, [0, self.length].concat(array));
        };

        document.createElement = function (tagName)
        {
          var element = createElement(tagName);
          var classList = [];

          element.classList = {
            add: function ()
            {
              for(var object = toObject(classList), index = 0, token; index in arguments; ++index)
              {
                token = tokenize(arguments[index]);

                object[token] = true;
              }

              fromObject(classList, object);

              element.className = join.call(classList, ' ');
            },
            remove: function ()
            {
              for(var object = toObject(classList), index = 0, token; index in arguments; ++index)
              {
                token = tokenize(arguments[index]);

                object[token] = false;
              }

              fromObject(classList, object);

              element.className = join.call(classList, ' ');
            }
          };

          return element;
        };
      }
    }(Array.prototype.join, Array.prototype.splice, document.createElement));
  }

  // Polyfill for Object.Keys
  // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
  if(!Object.keys) {
    Object.keys = (function () {
      'use strict';
      var hasOwnProperty = Object.prototype.hasOwnProperty,
          hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
          dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
          ],
          dontEnumsLength = dontEnums.length;

      return function (obj) {
        if(typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
          throw new TypeError('Object.keys called on non-object');
        }

        var result = [], prop, i;

        for(prop in obj) {
          if(hasOwnProperty.call(obj, prop)) {
            result.push(prop);
          }
        }

        if(hasDontEnumBug) {
          for(i = 0; i < dontEnumsLength; i++) {
            if(hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
          }
        }
        return result;
      };
    }());
  }

  // Polyfill for Array.prototype.forEach
  // Production steps of ECMA-262, Edition 5, 15.4.4.18
  // Reference: http://es5.github.io/#x15.4.4.18
  if(!Array.prototype.forEach) {

    Array.prototype.forEach = function (callback, thisArg) {

      var T, k;

      if(this == null) {
        throw new TypeError(' this is null or not defined');
      }

      // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
      var O = Object(this);

      // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;

      // 4. If IsCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if(typeof callback !== "function") {
        throw new TypeError(callback + ' is not a function');
      }

      // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if(arguments.length > 1) {
        T = thisArg;
      }

      // 6. Let k be 0
      k = 0;

      // 7. Repeat, while k < len
      while(k < len) {

        var kValue;

        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if(k in O) {

          // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
          kValue = O[k];

          // ii. Call the Call internal method of callback with T as the this value and
          // argument list containing kValue, k, and O.
          callback.call(T, kValue, k, O);
        }
        // d. Increase k by 1.
        k++;
      }
      // 8. return undefined
    };
  }

  // Production steps of ECMA-262, Edition 5, 15.4.4.19
  // Reference: http://es5.github.io/#x15.4.4.19
  if(!Array.prototype.map) {

    Array.prototype.map = function (callback, thisArg) {

      var T, A, k;

      if(this == null) {
        throw new TypeError(' this is null or not defined');
      }

      // 1. Let O be the result of calling ToObject passing the |this|
      //    value as the argument.
      var O = Object(this);

      // 2. Let lenValue be the result of calling the Get internal
      //    method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;

      // 4. If IsCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if(typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }

      // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if(arguments.length > 1) {
        T = thisArg;
      }

      // 6. Let A be a new array created as if by the expression new Array(len)
      //    where Array is the standard built-in constructor with that name and
      //    len is the value of len.
      A = new Array(len);

      // 7. Let k be 0
      k = 0;

      // 8. Repeat, while k < len
      while(k < len) {

        var kValue, mappedValue;

        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal
        //    method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if(k in O) {

          // i. Let kValue be the result of calling the Get internal
          //    method of O with argument Pk.
          kValue = O[k];

          // ii. Let mappedValue be the result of calling the Call internal
          //     method of callback with T as the this value and argument
          //     list containing kValue, k, and O.
          mappedValue = callback.call(T, kValue, k, O);

          // iii. Call the DefineOwnProperty internal method of A with arguments
          // Pk, Property Descriptor
          // { Value: mappedValue,
          //   Writable: true,
          //   Enumerable: true,
          //   Configurable: true },
          // and false.

          // In browsers that support Object.defineProperty, use the following:
          // Object.defineProperty(A, k, {
          //   value: mappedValue,
          //   writable: true,
          //   enumerable: true,
          //   configurable: true
          // });

          // For best browser support, use the following:
          A[k] = mappedValue;
        }
        // d. Increase k by 1.
        k++;
      }

      // 9. return A
      return A;
    };
  }

  if(!document.createElementNS)
  {
    (function (createElement) {

      document.createElementNS = function (namespace, tagName)
      {
        return createElement(tagName);
      }

    })(document.createElement);
  }

})(this);
