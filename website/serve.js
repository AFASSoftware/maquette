// Serves the website locally (live reload enabled)
const watch = require('metalsmith-watch');
const serve = require('metalsmith-serve');
const init = require('./init').init;

init({injectScript: '<script src="http://localhost:5001/livereload.js"></script>'})
  .use(serve({
    port: 5000
  }))
  .use(watch({
    paths: {
      "${source}/**/*": true,
      "layouts/**/*": "**/*",
      "partials/**/*": "**/*",
      "postcss/**/*": "**/*"
    },
    livereload: 5001
  }))
  .build(function(err) {
    if (err) {
      throw err;
    }
  });
