var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
var shell = require('gulp-shell');

var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');

var ts = require('gulp-typescript');
var wrapJS = require('gulp-wrap-js');

var plumber = require('gulp-plumber');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var typedoc = require('gulp-typedoc');

const mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');

var ONE_DAY = 24 * 60 * 60 * 1000;

var BROWSERSYNC_PORT = parseInt(process.env.PORT) || 3002;
var BROWSERSYNC_HOST = process.env.IP || '127.0.0.1';

var clearScreen = function () {
  if (path.separator === '/') {
    console.log('\033[2J\033[1;1H'); // linux
  } else {
    console.log('\033c'); // windows
  }
};

var setWatching = function (notify) {
  var gulp_src = gulp.src;
  gulp.src = function() {
    return gulp_src.apply(gulp, arguments)
      .pipe(plumber(function(error) {
        if (error) {
          console.error('Error (' + error.plugin + '): ' + error.message);
          if (notify) {
            notify(error.message);
          }
        } else {
          console.error('Error');
          if (notify) {
            notify('Error');
          }
        }
      })
    );
  };
};

var compile = function() {
  var configTypescript = require('./tsconfig.json').compilerOptions;
  configTypescript.typescript = require('typescript');
	return gulp.src(['src/**/*.ts', 'test/**/*.ts', 'typings/**/*.ts'], {base: '.'})
    .pipe(sourcemaps.init())
		.pipe(ts(configTypescript))
    .pipe(sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: function (file) {
        return file.relative.split(path.sep).map(function () {
            return '..'
          }).join('/').substr(3);// + '/../../';// + '../';
      }
    }))
		.pipe(gulp.dest('build/js'));
};
gulp.task('compile', compile);

gulp.task('declaration', function() {
  var configTypescript = require('./tsconfig.json').compilerOptions;
  configTypescript.declaration = true;
  configTypescript.typescript = require('typescript');
	return gulp.src('src/**/*.ts')
		.pipe(ts(configTypescript))
    .dts
		.pipe(gulp.dest('dist'));
});

gulp.task('test', ['compile'], function() {
  return gulp.src(['build/js/test/**/*.js'], {read: false})
    .pipe(mocha({reporter: 'spec', timeout: 5000}));
});

// This seems to be the most lightweight solution to create an UMD wrapper and working sourcemaps
var umdTemplate = function(windowGlobalName) {
  return "(function (root, factory) {" +
  "\n  if (typeof define === 'function' && define.amd) {" +
  "\n      // AMD. Register as an anonymous module." +
  "\n      define(['exports'], factory);" +
  "\n  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {" +
  "\n      // CommonJS" +
  "\n      factory(exports);" +
  "\n  } else {" +
  "\n      // Browser globals" +
  "\n      factory(root." + windowGlobalName + " = {});" +
  "\n  }" +
  "\n}(this, function (exports){%= body %}));";
};

gulp.task('distMaquette', ['compile'], function() {
  return gulp.src('build/js/src/maquette.js')
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(wrapJS(umdTemplate('maquette')))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));

});

gulp.task('distCssTransitions', ['compile'], function() {
  return gulp.src('build/js/src/css-transitions.js')
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(wrapJS(umdTemplate('cssTransitions')))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('dist', ['distMaquette', 'distCssTransitions']);

gulp.task('dist-min-maquette', ['compile'], function() {
  return gulp.src('build/js/src/maquette.js')
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(wrapJS(umdTemplate('maquette')))
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('dist-min-cssTransitions', ['compile'], function() {
  return gulp.src('build/js/src/css-transitions.js')
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(wrapJS(umdTemplate('cssTransitions')))
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('dist-min', ['dist', 'dist-min-maquette', 'dist-min-cssTransitions']);

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
      out: "build/typedoc/",
      name: "Maquette",
      excludeNotExported: true,
      excludeExternals: true,
      includeDeclarations: false,
      exclude: 'node_modules/typedoc/node_modules/typescript/lib/lib.d.ts',
      gaID: 'UA-58254103-1',
      readme: 'none'
    }));
});

gulp.task('default', ['coverage', 'compress', 'dist-min', 'check-size', 'declaration']);

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

gulp.task('serve', ['compress', 'dist-min'], function () {
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

gulp.task('coverage', shell.task(['npm run coverage']));

gulp.task('dev', function() {
  var bs = null;
  setWatching(function (error) {
    if (bs) {
      bs.notify(error, ONE_DAY);
    }
  });

  compile().on('end', function() {
    coverage(function(err) {
      var browserSync = require('browser-sync');
      bs = browserSync.create();
      bs.init({
        port: 1904,
        ui: { port: 3011 },
        ghostMode: false,
        server: 'build/report/lcov-ts-report',
        open: 'local'
      });
      if (err) {
        setTimeout(function(){
          bs.notify(err.message, ONE_DAY);
        }, 5000);
      }
      gulp.watch(['src/**/*.ts', 'test/**/*.ts', 'typings/**/*.ts'], function () {
        var abort = false;
        clearScreen();
        console.log('Building...');

        bs.notify('Building...', ONE_DAY);
        compile(true).on('error', function (error) {
          console.error('Build error');
          bs.notify('Build error', ONE_DAY);
          abort = true;
        }).on('finish', function () {
          if (abort) {
            return;
          }
          console.log('Build successful');
          console.log('Running tests and measuring coverage...');
          bs.notify('Running tests and measuring coverage...', ONE_DAY);
          coverage(function (err) {
            if (err) {
              bs.reload();
              setTimeout(function(){
                bs.notify(err.message, ONE_DAY);
              }, 2000);
            } else {
              bs.reload();
              setTimeout(function(){
                bs.notify("One HUNDRED percent!", ONE_DAY);
              }, 2000);
            }
            console.log('Coverage finished');
          });
        });
      });
    });
  });
});
