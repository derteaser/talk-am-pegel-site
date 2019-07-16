var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-csso');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');


gulp.task('css', function () {
  return gulp
    .src('site.scss')
      .pipe(sourcemaps.init())
      .pipe(sass())
      .pipe(rename('site.min.css'))
      .pipe(minifyCSS())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('../css'))
});

gulp.task('js', function(){
  return gulp.src(['node_modules/uikit/dist/js/uikit.js', 'node_modules/uikit/dist/js/uikit-icons.js', 'node_modules/umbrellajs/umbrella.js', 'site.js'])
      .pipe(sourcemaps.init())
      .pipe(concat('site.min.js'))
      .pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('../js'))
});

gulp.task('default', gulp.series('css', 'js'));