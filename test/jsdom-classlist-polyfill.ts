// classList is not supported by jsdom, so we need to add this one ourselves.
// Copied from/inspired by
// https://github.com/tmpvar/jsdom/issues/510

/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2012-11-15
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

export = function(view: any) {
  if (!('HTMLElement' in view) && !('Element' in view)) { return; }

  var
    classListProp = 'classList'
    , protoProp = 'prototype'
    , elemCtrProto = (view.HTMLElement || view.Element)[protoProp]
    , objCtr = Object
    , strTrim = (<any>String)[protoProp].trim || function() {
      return this.replace(/^\s+|\s+$/g, '');
    }
    , arrIndexOf = (Array as any)[protoProp].indexOf || function(item: any) {
      var
        i = 0
        , len = this.length
        ;
      for (; i < len; i++) {
        if (i in this && this[i] === item) {
          return i;
        }
      }
      return -1;
    }
    // Vendors: please allow content code to instantiate DOMExceptions
    , DOMEx = function(type: any, message: any) {
      this.name = type;
      this.code = (DOMException as any)[type];
      this.message = message;
    }
    , checkTokenAndGetIndex = function(classList: any, token: any) {
      if (token === '') {
        throw new (<any>DOMEx(
          'SYNTAX_ERR'
          , 'An invalid or illegal string was specified'
        ));
      }
      if (/\s/.test(token)) {
        throw new (<any>DOMEx(
          'INVALID_CHARACTER_ERR'
          , 'String contains an invalid character'
        ));
      }
      return arrIndexOf.call(classList, token);
    }
    , ClassList = function(elem: any) {
      var
        trimmedClasses = strTrim.call(elem.className)
        , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
        , i = 0
        , len = classes.length
        ;
      for (; i < len; i++) {
        this.push(classes[i]);
      }
      this._updateClassName = function() {
        elem.className = this.toString();
      };
    }
    , classListProto: any = (ClassList as any)[protoProp] = []
    , classListGetter = function() {
      return new (<any>ClassList)(this);
    }
    ;
  // Most DOMException implementations don't allow calling DOMException's toString()
  // on non-DOMExceptions. Error's toString() is sufficient here.
  (DOMEx as any)[protoProp] = (Error as any)[protoProp];
  classListProto.item = function(i: any) {
    return this[i] || null;
  };
  classListProto.contains = function(token: any) {
    token += '';
    return checkTokenAndGetIndex(this, token) !== -1;
  };
  classListProto.add = function() {
    var
      tokens = arguments
      , i = 0
      , l = tokens.length
      , token: any
      , updated = false
      ;
    do {
      token = tokens[i] + '';
      if (checkTokenAndGetIndex(this, token) === -1) {
        this.push(token);
        updated = true;
      }
    }
    while (++i < l);

    if (updated) {
      this._updateClassName();
    }
  };
  classListProto.remove = function() {
    var
      tokens = arguments
      , i = 0
      , l = tokens.length
      , token: any
      , updated = false
      ;
    do {
      token = tokens[i] + '';
      var index = checkTokenAndGetIndex(this, token);
      if (index !== -1) {
        this.splice(index, 1);
        updated = true;
      }
    }
    while (++i < l);

    if (updated) {
      this._updateClassName();
    }
  };
  classListProto.toggle = function(token: any, forse: any) {
    token += '';

    var
      result = this.contains(token)
      , method = result ?
        forse !== true && 'remove'
        :
        forse !== false && 'add'
      ;

    if (method) {
      this[method](token);
    }

    return !result;
  };
  classListProto.toString = function() {
    return this.join(' ');
  };

  if (objCtr.defineProperty) {
    var classListPropDesc = {
      get: classListGetter
      , enumerable: true
      , configurable: true
    };
    try {
      objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
    } catch (ex) { // IE 8 doesn't support enumerable:true
      if (ex.number === -0x7FF5EC54) {
        classListPropDesc.enumerable = false;
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      }
    }
  } else if ((objCtr as any)[protoProp].__defineGetter__) {
    elemCtrProto.__defineGetter__(classListProp, classListGetter);
  }
}
