---
layout: default
title: Why a new virtual DOM framework
---
# Why a new virtual DOM framework

There are many virtual DOM frameworks to choose from already. 
React is widely used, Mithril is very good, many others look promising as well. 
Still, the framework I have in mind does not yet exist.

First of all, I like animated transitions. AngularJS style, like React's CSSTransitionGroup.
Second, I want a lightweight framework. With lightweight I mean: Fast, easy to learn, easy to debug
and predictable.

So React is too heavyweight and Mithril does not really have animated transitions. 
I know animated transitions can be added in Mithril, but I do not want to clutter up my code like that.

So I decided to build my own virtual DOM framework. How hard can it be?
So focussing on animated transitions first, I realized that there would be disappearing 
elements in the real DOM that are no longer part of the virtual DOM. These DOM nodes should
be left alone. This is why I settled on the following implementation:

- Make the animation strategy pluggable thus allowing both velocityJS and CSS Transitions.
- Keep a reference to the rendered DOM node on virtual DOM nodes.
- Diffing and patching is done simultaneously.
- Virtual DOM nodes are considered immutable. This allows a powerful caching mechanism based on comparing object identity. 

Keeping a reference to the rendered DOM on virtual DOM nodes is what makes maquette really different from other implementations.
I look forward to seeing what the performance implications of this decision are and what other possibilities this enables
like progressive enhancement.

<a href="{{ site.baseurl }}/">Return to the main page</a>
