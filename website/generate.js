var Metalsmith  = require('metalsmith');
var layouts     = require('metalsmith-layouts');
var markdown    = require('metalsmith-markdown');
var inPlace     = require('metalsmith-in-place');

Metalsmith(__dirname)
  .metadata({
    googleAnalyticsKey: 'UA-58254103-1',
    maquetteVersion: '2.4.1',
    // defaults, can be overridden per page
    liveEditors: false,
    liveEditorsVelocity: false,
    liveEditorsCss: false
  })
  .source('source')
  .destination('../build/website')
  .clean(true)
  .use(markdown())
  .use(layouts({
    engine: 'ejs',
    directory: 'layouts',
//    rename: true,
    pattern: '**/*.ejs',
    partials: 'partials'
  }))
  .use(inPlace())
  .build(function(err) {
    if (err) throw err;
  });
