---
layout: default
title: Different approach to stateful components
---

### Different approach to stateful components

Stateful components is a concept that [React](http://facebook.github.io/react/) uses to preserve state in components across renders.

Maquette uses a fundamentally different approach.
Component lifecycles are not managed by the virtual DOM library, but by the programmer.

This brings the following advantages:

1. Maquette performs better. Performance is generally never a problem with maquette.
2. Maquette is easier to understand. No need for props and state objects in your components.
3. Maquette gives you more flexibility about how you manage your components.

Managing components is usually quite straightforward. 
First you transform your data into components. 
Then you use these components to construct parts of the virtual DOM.

The only scenario in which managing components is challenging is when an array of data is mapped to an array of stateful components 
and the array of data gets updated externally. 
This is typical use-case for a realtime collaborative application. 
Since version 1.8 maquette provides a mapping utility that can update an array of components to match the underlying data.

This functionality is explained [here](/docs/arrays.html).
The crux: synchronizing data to components is different from synchronizing the real DOM to the virtual DOM. 
Stateful components benefit from reordering while updating the DOM with animations is easier and more flexible when you just have adds and removes.