// The code below can be copy-pasted onto the developer console

(function () {

  window.makeh = function (element) {
    if (element.nodeValue) {
      if(element.nodeValue.indexOf("\"") > 0 || element.nodeValue.trim().length === 0) {
        return "null";
      }
      return "\"" + element.nodeValue.trim() + "\"";
    }
    if(element.style.display === "none") {
      return "null";
    }
    var properties = [];
    var children = [];
    var classes = element.className.split(" ");
    var selector = element.tagName.toLowerCase();
    if(selector !== "svg") {
      for(var i=0;i<element.childNodes.length;i++) {
        var child = element.childNodes[i];
        children.push(makeh(child));
      }
    }
    if(element.id) {
      selector = selector + "#" + element.id;
    }
    if(classes.length > 1) {
      selector = selector + "." + classes[0];
      classes.shift();
    }
    if(element.href) {
      properties.push("href:\""+element.href+"\"");
    }
    if(element.src) {
      properties.push("src:\"" + element.href + "\"");
    }
    return "h(\"" + selector + "\", {"+properties.join()+"}, ["+children.join()+"])";
  };

  console.log(makeh(document.body));

})();