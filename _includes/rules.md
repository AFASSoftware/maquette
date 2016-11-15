Before you are ready to start using maquette, you need to be aware of three rules, which are all easy to follow.
These rules are there to make sure maquette can generally render and diff very large pages at 60 frames per second on every device.

## Rule #1 Do not change event handlers

Changing event handlers, like `onclick` for example, is rarely useful.
Updating an event handler is costly if you accidentally change them on every render.
Because this mistake that is so easy to make, maquette disallows changing event handlers completely.

## Rule #2 Always provide the same set of properties

If you render `h('a', {href: '.' target: '_blank'})` and then you want to clear the `target` attribute,
you need to use either `h('a', {href: '.' target: undefined})`, `h('a', {href: '.' target: null})` or `h('a', {href: '.' target: ''})`.
If you use `h('a', {href: '.'})` maquette will **not** clear the `target` attribute.
This is because maquette does not sacrifice performance searching for properties that you left out.
This makes you responsible to always provide the same set of properties. The same principe applies to the nested `classes` and `styles` objects.

## Rule #3 Distinguishable children

The last rule states that if a node has multiple childnodes with the same selector
**and** these childnodes are added or removed dynamically,
then they must have unique key properties.


A key property is typically used as follows:
(If you are unfamilliar with the javascript map() function see <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map" target="_blank">this description on MDN</a>)

    h("ul", [
      items.map(function(item) {
        return h("li", {key: item.id}, [item.text]);
      })
    ])

This rule makes sure that a node is never accidentally morphed into an adjecent node and thereby doing the wrong animation or accidentally triggering a violation of one of the first two rules.
