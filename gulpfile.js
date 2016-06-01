'use strict'
/*
  Gulp File for WakaruLand

  browserify + babelify

  @Hikaru
*/
var gulp = require('gulp');
var babel = require("gulp-babel");
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('babel', function() {
  gulp.src('./**/*.es6')
    .pipe(babel())
    .pipe(gulp.dest('./'))
    .pipe(reload({ stream: true }));
});

gulp.task('browser-sync', function() {
   browserSync({
     server: {
       baseDir: './',
     },
     open: 'external',
     port: 7070
   });
});

gulp.task('watch', function() {
  gulp.watch('./**/*.es6', ['babel']);
  gulp.watch('./**/*.html', reload);
  gulp.watch('./**/*.css', reload);
});


gulp.task('default', ['babel', 'watch', 'browser-sync']);
