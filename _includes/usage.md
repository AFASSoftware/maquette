Maquette makes it easy to keep your user interface synchronized with your data.
All you need to do is provide a `renderMaquette()` function which creates the current state of your 
user interface from scratch.
After that you create a projector using `createProjector()` passing it a DOM node and the render function.
The projector will then take care of creating and updating the DOM when needed.
The projector calls the render function at the right moments, just before the browser paints the next frame but only ifthe DOM may have changed.
The projector compares the newly rendered user interface with the previous one and changes the DOM. This can be done using animations.
This recreating from scratch and finding differences may seem inefficient, but it is fast enough to run at 60 frames per second even with large pages on low-power devices.

Start [learning maquette](tutorial/1-intro.html)

More info can be found in the [API Reference](https://github.com/johan-gorter/maquette/blob/master/docs/API.md).
