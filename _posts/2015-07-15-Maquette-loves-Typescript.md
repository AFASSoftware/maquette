---
layout: default
title: Maquette loves Typescript
---

We recently gained some experience using Maquette with Typescript.
We were very impressed by how well Typescript is supported by IDE's
and how well it integrates with NodeJS build tooling.

During the making of a Typescript definition file for Maquette we discovered
how natural Typescript works with Maquette.
We never had to use **any** or **Object** as a parameter or return value in the API.
This is because, unlike other popular frontend frameworks, 
Maquette does not use untyped objects like state bags or contexts.

We have taken the screenshots below to demonstrate the level of autocompletion 
that *Visual Studio Code* (a free cross platform IDE) can provide when writing code using the maquette API.
Other IDE's, like *IntelliJ* and *Visual Studio* provide the same kind of autocompletion.
The Typescript compiler can also be used from build scripts of course.

![screenshot api](/img/api.png)

![screenshot properties](/img/properties.png)

We created a small demonstration of a Maquette application written in entirely in Typescript.
It is almost identical to the Javascript version, but now everything gets type-checked by the compiler.
The only typecast we needed was one from `event.target` to `HTMLInputElement` to read the value. 
We have put the code on GitHub for everyone to review and comment on.

<a href="https://github.com/AFASSoftware/maquette-demo-typescript" class="button">Source code on GitHub</a>

We hope you are just as impressed as we are.

<br />

<blockquote class="twitter-tweet" lang="nl"><p lang="en" dir="ltr">Use <a href="https://twitter.com/hashtag/maquettejs?src=hash">#maquettejs</a> with <a href="https://twitter.com/hashtag/TypeScript?src=hash">#TypeScript</a> to create a fully type-safe Virtual DOM experience <a href="http://t.co/F20VZLZZvD">http://t.co/F20VZLZZvD</a></p>&mdash; Johan Gorter (@JohanGorter) <a href="https://twitter.com/JohanGorter/status/621689864535306240">16 juli 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
