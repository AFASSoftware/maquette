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
  .use(inPlace())
  .use(markdown())
  .use(layouts({
    engine: 'ejs',
    directory: 'layouts'
  }))
  .build(function(err) {
    if (err) throw err;
  });
