var Metalsmith  = require('metalsmith');
var layouts     = require('metalsmith-layouts');
var markdown    = require('metalsmith-markdown');
var inPlace     = require('metalsmith-in-place');
var postcss     = require('metalsmith-postcss');

exports.init = (args) => {

  return Metalsmith(__dirname)
    .metadata({
      injectScript: args.injectScript || '',
      maquetteVersion: require('../package.json').version,
      // defaults, can be overridden per page
      liveEditors: false,
      liveEditorsVelocity: false,
      liveEditorsCss: false,
      workbench: false
    })
    .source('source')
    .destination('./build/website')
    .clean(true)
    .use(inPlace({
      engineOptions: {
        root: __dirname
      }
    }))
    .use(markdown())
    .use(layouts({
      engine: 'ejs',
      directory: 'layouts',
      engineOptions: {
        root: __dirname
      }
    }))
    .use(postcss({
      plugins: {
        'precss': {}
      }
    }));
};
