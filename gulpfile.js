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
      .pipe(tag_version());
}

gulp.task('patch', ["compress"], function () { return inc('patch'); });
gulp.task('feature', ["compress"], function () { return inc('minor'); });
gulp.task('release', ["compress"], function () { return inc('major'); });

// Working tree status
gulp.task('status', function () {
  git.status({ args: '--porcelain' }, function (err, stdout) {
    if (stdout) throw "Unstaged commits";
  });
});
