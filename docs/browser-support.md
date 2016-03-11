---
layout: default
title: Browser support
---
Maquette goes a long way in supporting older browsers. 
There are however some things you should be aware of.

## Polyfills

All evergreen browsers (Edge, Chrome and Firefox) do not require polyfills, 
as do IE10 and IE11. 
For IE7-IE9 and iOS6 we provide [polyfills](https://github.com/AFASSoftware/maquette/blob/master/dist/maquette-polyfills.min.js) in the distribution.

## The input event 
The `input` event (`oninput` property) is not available in IE7 and IE8 and is buggy in IE9. 
If you need to support these browsers, we recommend you use the `onkeyup` event.

## SVG
Inline svg (using `h('svg', [...])`) only works in IE9 and newer. 
Also, adding CSS classes to svg nodes (for example: `h('circle.dark')`) does not work in any version of IE.