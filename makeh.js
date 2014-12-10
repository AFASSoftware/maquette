// The code below can be copy-pasted into the developer console to get a translation from html to hyperscript

(function () {

  var lastKey = 0;

  window.makeh = function (element) {
    if (element.nodeValue) {
      if(element.nodeType !== 3 || element.nodeValue.indexOf("\"") > 0 || element.nodeValue.trim().length === 0) {
        return null;
      }
      return "\"" + element.nodeValue.trim() + "\"";
    }
    if(!element.tagName || element.style.display === "none") {
      return null;
    }
    var properties = [];
    var children = [];
    var classes = [];
    var selector = element.tagName.toLowerCase();
    if (selector !== "svg") {
      classes = element.className.split(" ");
      for(var i=0;i<element.childNodes.length;i++) {
        var child = element.childNodes[i];
        children.push(makeh(child));
      }
    }
    if(element.id) {
      selector = selector + "#" + element.id;
    }
    if(classes[0]) {
      selector = selector + "." + classes[0];
      classes.shift();
      if(classes.length > 0) {
        properties.push("classes:{" + classes.map(function (c) { return "\"" + c + "\":true"; }).join() + "}");
      }
    }
    if (!element.id) {
      properties.push("key:"+(++lastKey));
    }
    if(element.href) {
      properties.push("href:\""+element.href+"\"");
    }
    if(element.src) {
      properties.push("src:\"" + element.src + "\"");
    }
    if (element.value) {
      properties.push("value:\"" + element.value + "\"");
    }
    return "\n  h(\"" + selector + "\", {" + properties.join() + "}, [" + children.filter(function (c) { return !!c; }).join() + "])";
  };

  console.log(makeh(document.body));

})();