var gulp=require("gulp");
var uglify=require("gulp-uglify");
var rename = require('gulp-rename');
var del = require('del');

var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var BROWSERSYNC_PORT = parseInt(process.env.PORT) || 3002;
var BROWSERSYNC_HOST = process.env.IP || "127.0.0.1";

gulp.task("compress",  function() {
  gulp.src("src/*.js")
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest("dist"));
});

gulp.task('clean', function(cb) {
  del(['dist'], cb);
});

gulp.task("default", ["compress"]);

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
gulp.task('bump-patch', ["compress"], function () { return inc('patch'); });
gulp.task('bump-minor', ["compress"], function () { return inc('minor'); });
gulp.task('bump-major', ["compress"], function () { return inc('major'); });

gulp.task('reload', reload);

gulp.task('serve', ['default'], function () {
  browserSync({
    port: BROWSERSYNC_PORT,
    host: host,
    notify: false,
    server: '.'
  });
    
  gulp.watch('./src/**/*', ['compress', 'reload']);
  gulp.watch('./examples/**/*', ['reload']);
  gulp.watch('./browser-tests/**/*', ['reload']);
});