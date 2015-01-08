The first question that people usually ask when they are new to virtual DOM is, how well does it perform?
After all, rendering the whole represenation of the DOM and determining the difference with the 
previous render seems slow.
In my experience, rendering and diffing a large screen (say 2000 DOM nodes) is easily done within a single 
frame (16ms) on modern devices. May the speed become an issue, maquette also has a powerful caching
mechanism which speeds up rendering and diffing significantly.
