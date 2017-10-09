// Generates the website under ./build/website

const init = require('./init').init;

init({}).build(function(err) {
  if (err) {
    throw err;
  }
});
