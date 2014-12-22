var gulp=require("gulp");
var uglify=require("gulp-uglify");
var rename = require('gulp-rename');
var del = require('del');

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