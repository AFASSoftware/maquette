 
## News

{% for post in site.posts %}
*{{ post.date | date_to_string }}* - 
<a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a>
{% endfor %}

## Intro

Maquette is a Javascript library which makes it easy to keep the DOM tree in the browser synchronized with your data.
It uses a technique called **Virtual DOM**.
Compared to other virtual DOM implementations, maquette has 3 advantages:

- It is ultra lightweight (Only 2.4Kb gzipped)
- It allows changes to be animated
- It is optimized for speed

While maquette is only focussed around the view of an application, we believe it is capable of powering a fully functional web application. The [todomvc](https://github.com/johan-gorter/maquette/blob/master/examples/todomvc) example demonstrates how to do this.
