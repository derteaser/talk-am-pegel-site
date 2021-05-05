'use strict';

const gulp = require('gulp');
const env = require('gulp-env');
const postcss = require('gulp-postcss');
const minifyCSS = require('gulp-csso');
const rename = require('gulp-rename');
const svgSprite = require('gulp-svg-sprite');
const svgMin = require('gulp-svgmin');

gulp.task('dev-css', function () {
  return gulp
    .src('./css/tap-tailwind.css')
    .pipe(postcss([
      require('postcss-import'),
      require('tailwindcss'),
      require('postcss-nested'),
      require('autoprefixer'),
    ]))
    .pipe(rename('app.css'))
    .pipe(gulp.dest('./dist'))
});

gulp.task('prod-css', function () {
  const envs = env.set({
    NODE_ENV: 'production'
  });
  return gulp
    .src('./css/tap-tailwind.css')
    .pipe(postcss([
      require('postcss-import'),
      require('tailwindcss'),
      require('postcss-nested'),
      require('autoprefixer'),
    ]))
    .pipe(rename('app.min.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./dist'))
});

gulp.task('copy-js-tools', function () {
  return gulp.src([
    'node_modules/aos/dist/*'
  ])
    .pipe(gulp.dest('./dist'));
});

gulp.task('svg', function () {
  return gulp.src([
    'img/*.svg'
  ])
    .pipe(svgMin())
    .pipe(gulp.dest('./dist/img'));
});

gulp.task('icons', function () {
  const config = {
    mode: {
      symbol: {
        dest: '.',
        sprite: 'icons.svg'
      }
    }
  };

  return gulp.src([
    // Directions
    'node_modules/heroicons/outline/chevron-left.svg',
    'node_modules/heroicons/outline/chevron-right.svg',
    'node_modules/heroicons/outline/arrow-down.svg',
    'node_modules/heroicons/outline/arrow-right.svg',
    // Brands
    'node_modules/simple-icons/icons/facebook.svg',
    'node_modules/simple-icons/icons/linkedin.svg',
    'node_modules/simple-icons/icons/twitter.svg',
    'node_modules/simple-icons/icons/xing.svg',
    // Misc
    'node_modules/heroicons/solid/calendar.svg',
    'node_modules/heroicons/solid/clock.svg',
    'node_modules/heroicons/outline/globe-alt.svg',
    'node_modules/heroicons/solid/location-marker.svg',
    'node_modules/heroicons/outline/ticket.svg',
    'node_modules/heroicons/solid/video-camera.svg',
  ])
    .pipe(svgSprite(config))
    .pipe(gulp.dest('dist/img'));
})

gulp.task('default', gulp.series('dev-css', 'prod-css', 'copy-js-tools', 'icons', 'svg'));
