var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var merge = require('merge2');

var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');

var ts = require('gulp-typescript');
var wrapJS = require('gulp-wrap-js');

var browserify = require('browserify');
var tsify = require('tsify');
var gutil = require('gulp-util');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var typedoc = require('gulp-typedoc');

var BROWSERSYNC_PORT = parseInt(process.env.PORT) || 3002;
var BROWSERSYNC_HOST = process.env.IP || '127.0.0.1';

gulp.task('compile', function() {
  var configTypescript = require('./tsconfig.json').compilerOptions;
  configTypescript.typescript = require('typescript');
	return gulp.src('src/**/*.ts')
    .pipe(sourcemaps.init())
		.pipe(ts(configTypescript))
    .pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('build/js'));
});

gulp.task('declaration', function() {
  var configTypescript = require('./tsconfig.json').compilerOptions;
  configTypescript.declaration = true;
  configTypescript.typescript = require('typescript');
	return gulp.src('src/**/*.ts')
		.pipe(ts(configTypescript))
    .dts
		.pipe(gulp.dest('dist'));
});

// This seems to be the most lightweight solution to create an UMD wrapper and working sourcemaps
var umdTemplate = "(function (root, factory) {" +
  "\n  if (typeof define === 'function' && define.amd) {" +
  "\n      // AMD. Register as an anonymous module." +
  "\n      define(['exports'], factory);" +
  "\n  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {" +
  "\n      // CommonJS" +
  "\n      factory(exports);" +
  "\n  } else {" +
  "\n      // Browser globals" +
  "\n      factory((root.maquette = {}));" +
  "\n  }" +
  "\n}(this, function (exports){%= body %}));";

gulp.task('dist', ['compile'], function() {
  return gulp.src('build/js/maquette.js')
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(wrapJS(umdTemplate))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('dist-min', ['dist'], function() {
  return gulp.src('build/js/maquette.js')
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(wrapJS(umdTemplate))
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('check-size', ['dist-min'], function(callback) {
  var zlib = require('zlib');
  var fs = require('fs');
  var input = fs.createReadStream('./dist/maquette.min.js');
  var stream = input.pipe(zlib.createGzip());
  var length = 0;
  stream.on('data', function(chunk) {
    length += chunk.length;
  });
  stream.on('end', function() {
    console.log('gzipped size in kB:', length/1024);
    if (length >= 3.5 * 1024) {
      return callback(new Error('Claim that maquette is only 3 kB gzipped no longer holds'));
    }
    callback();
  });
});

gulp.task('compress',  function() {
  gulp.src('src/*.js')
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function(cb) {
  del(['dist', 'build'], cb);
});

gulp.task('typedoc', function() {
  return gulp
    .src(["src/**/*.ts"])
    .pipe(typedoc({
      module: "commonjs",
      target: "es5",
      out: "build/docs/",
      name: "Maquette",
      excludeNotExported: true,
      excludeExternals: true,
      includeDeclarations: false,
      exclude: 'node_modules/typedoc/node_modules/typescript/lib/lib.d.ts',
      gaID: 'UA-58254103-1',
      readme: 'none'
    }));
});

gulp.task('default', ['compress', 'dist-min', 'check-size', 'declaration']);

function inc(importance) {
  // get all the files to bump version in
  return gulp.src(['./package.json', './bower.json'])
    // bump the version number in those files
    .pipe(bump({ type: importance }))
    // save it back to filesystem
    .pipe(gulp.dest('./'))
    // commit the changed version number
    .pipe(git.commit('bumps package version'))
    // read only one file to get the version number
    .pipe(filter('package.json'))
    // **tag it in the repository**
    .pipe(tag_version());
}

// these tasks are called from scripts/release.js
gulp.task('bump-patch', ['compress'], function () { return inc('patch'); });
gulp.task('bump-minor', ['compress'], function () { return inc('minor'); });
gulp.task('bump-major', ['compress'], function () { return inc('major'); });

gulp.task('reload', reload);

gulp.task('serve', ['default'], function () {
  browserSync({
    port: BROWSERSYNC_PORT,
    host: BROWSERSYNC_HOST,
    notify: false,
    server: '.'
  });

  gulp.watch('./src/**/*', ['compress', 'reload']);
  gulp.watch('./examples/**/*', ['reload']);
  gulp.watch('./browser-tests/**/*', ['reload']);
});
