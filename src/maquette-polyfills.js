(function (global) {

  "use strict";

  // polyfill for window.requestAnimationFrame
  var haveraf = function(vendor) {
    return global.requestAnimationFrame && global.cancelAnimationFrame ||
      (
        (global.requestAnimationFrame = global[vendor + 'RequestAnimationFrame']) &&
        (global.cancelAnimationFrame = (global[vendor + 'CancelAnimationFrame'] ||
                                        global[vendor + 'CancelRequestAnimationFrame']))
      );
  };

  if (!haveraf('webkit') && !haveraf('moz') ||
      /iP(ad|hone|od).*OS 6/.test(global.navigator.userAgent)) { // buggy iOS6

    // Closures
    var now = Date.now || function() { return +new Date(); };   // pre-es5
    var lastTime = 0;

    // Polyfills
    global.requestAnimationFrame = function(callback) {
      var nowTime = now();
      var nextTime = Math.max(lastTime + 16, nowTime);
      return setTimeout(function() {
          callback(lastTime = nextTime);
        }, nextTime - nowTime);
    };
    global.cancelAnimationFrame = clearTimeout;
  }

  // polyfill for DOMTokenList and classList
  if(!("classList" in document.documentElement)) {

    (function (join, splice) {
      function tokenize(token) {
        if (/^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/.test(token)) {
          return String(token);
        } else {
          throw new Error('InvalidCharacterError: DOM Exception 5');
        }
      }

      function toObject(self) {
        for (var index = -1, object = {}, element; element = self[++index];) {
          object[element] = true;
        }

        return object;
      }

      function fromObject(self, object) {
        var array = [], token;

        for (token in object) {
          if (object[token]) {
            array.push(token);
          }
        }

        splice.apply(self, [0, self.length].concat(array));
      }

      // <Global>.DOMTokenlist
      global.DOMTokenList = function DOMTokenList() { };

      global.DOMTokenList.prototype = {
        constructor: DOMTokenList,
        item: function item(index) {
          return this[parseFloat(index)] || null;
        },
        length: Array.prototype.length,
        toString: function toString() {
          return join.call(this, ' ');
        },

        add: function add() {
          for (var object = toObject(this), index = 0, token; index in arguments; ++index) {
            token = tokenize(arguments[index]);

            object[token] = true;
          }

          fromObject(this, object);
        },
        contains: function contains(token) {
          return token in toObject(this);
        },
        remove: function remove() {
          for (var object = toObject(this), index = 0, token; index in arguments; ++index) {
            token = tokenize(arguments[index]);

            object[token] = false;
          }

          fromObject(this, object);
        },
        toggle: function toggle(token) {
          var
          object = toObject(this),
          contains = 1 in arguments ? !arguments[1] : tokenize(token) in object;

          object[token] = !contains;

          fromObject(this, object);

          return !contains;
        }
      };
    })(Array.prototype.join, Array.prototype.splice);

    //polyfill for classList
    (function (splice) {
      Object.defineProperty(Element.prototype, 'classList', {
        get: function () {

          function pull() {
            splice.apply(classList, [0, classList.length].concat((element.className || '').replace(/^\s+|\s+$/g, '').split(/\s+/)));
          }

          function push() {
            if(element.attachEvent) {
              element.detachEvent('onpropertychange', pull);
            }

            element.className = original.toString.call(classList);

            if(element.attachEvent) {
              element.attachEvent('onpropertychange', pull);
            }
          }

          var
            element = this,
            NativeDOMTokenList = global.DOMTokenList,
            original = NativeDOMTokenList.prototype,
            ClassList = function DOMTokenList() {},
            classList;

          ClassList.prototype = new NativeDOMTokenList;

          ClassList.prototype.item = function item(index) {
            return pull(), original.item.apply(classList, arguments);
          };

          ClassList.prototype.toString = function toString() {
            return pull(), original.toString.apply(classList, arguments);
          };

          ClassList.prototype.add = function add() {
            return pull(), original.add.apply(classList, arguments), push();
          };

          ClassList.prototype.contains = function contains(token) {
            return pull(), original.contains.apply(classList, arguments);
          };

          ClassList.prototype.remove = function remove() {
            return pull(), original.remove.apply(classList, arguments), push();
          };

          ClassList.prototype.toggle = function toggle(token) {
            return pull(), token = original.toggle.apply(classList, arguments), push(), token;
          };

          classList = new ClassList;

          if(element.attachEvent) {
            element.attachEvent('onpropertychange', pull);
          }

          return classList;
        }
      });
    })(Array.prototype.splice);

  }

})(this);
