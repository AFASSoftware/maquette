---
layout: default
title: Server communication
liveEditors: true
---

### Server communication

Maquette does not prescribe how you should communicate with the server, but there is
one gotcha. You must tell the maquette projector to rerender the DOM when data arrives asynchronously.

#### Using XMLHttpRequest

First let me show you how this can be done when you use plain XMLHttpRequest

{% include live-editor-start.html %}var result;

var load = function() {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function() {
    // Data has arrived asynchronously
    // We must now instruct the projector to update the DOM on the next frame
    projector.scheduleRender();
    
    result = xhr.responseText.length + ' bytes';
  });
  xhr.open('GET', '/index.html');
  xhr.send();
};

function renderMaquette() {
  return h('div', [
    h('button', {onclick:load}, ['Load']),
    h('p', [result])
  ]);
}

projector.append(domNode, renderMaquette);
{% include live-editor-end.html %}

#### Using a library

Most developers do not use XMLHttpRequest directly, but use some kind of library.
Most libraries provide some kind of hook which is invoked whenever a response arrives.
You can use such a hook to call `projector.scheduleRender()`.
I will show how this works with the lightweight promise-based [axios](https://github.com/mzabriskie/axios) library.

<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.9.1/axios.min.js"></script>
{% include live-editor-start.html %}var result;

// This axios instance calls scheduleRender automatically when data arrives
var axiosInstance = axios.create({
  transformResponse: function(data) {
    projector.scheduleRender();
    return data;
  }
});

var load = function() {
  axiosInstance.get('/index.html').then(function(response) {
    result = response.data.length + ' bytes';
  });
};

function renderMaquette() {
  return h('div', [
    h('button', {onclick:load}, ['Load']),
    h('p', [result])
  ]);
}

projector.append(domNode, renderMaquette);
{% include live-editor-end.html %}


More information about `scheduleRender` can be found in the [API](/docs/typedoc/interfaces/_maquette_.projector.html#schedulerender) documentation.
