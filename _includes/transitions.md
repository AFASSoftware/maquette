 
## Animated transitions

Until thus far, we have not yet explained how to animate transitions, while this is one of the main features of maquette. Maquette supports 2 techniques to do animations, CSS transitions and VelocityJS.

Both techniques are equally capable of delivering smooth sixty frames per second animations. Both techniques also profit from hardware acceleration equally. If you are unsure which technique to choose, we recommend VelocityJS. In general, VelocityJS is easier to learn and it has more possibilities. Follow these instructions to animate transitions using VelocityJS.

- Add the velocity.js and velocityTransitions.js to the page (using script tags or requireJS)
- Add the `transitions: velocityTransitions` option to the projector.
- Add enterAnimation and exitAnimation properties to the nodes that need to be animated.
  The value for this property is the first argument for the velocity.animate function. 
  You can use "slideDown" as enterAnimation and "slideUp" as exitAnimation for example.
- Enjoy!


