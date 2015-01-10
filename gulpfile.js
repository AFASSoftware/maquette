var gulp=require("gulp");
var uglify=require("gulp-uglify");
var rename = require('gulp-rename');
var del = require('del');

var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');

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
    .pipe(tag_version())
    .pipe(git.push('origin', 'master', function (err) {
      if (err) throw err;
    }))
    .pipe(git.push('origin', 'master', {args: "--tags"}, function (err) {
      if (err) throw err;
    }));
}

gulp.task('bump-patch', ["compress"], function () { return inc('patch'); });
gulp.task('bump-minor', ["compress"], function () { return inc('minor'); });
gulp.task('bump-major', ["compress"], function () { return inc('major'); });
