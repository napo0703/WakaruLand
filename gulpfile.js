'use strict'
/*
  Gulp File for WakaruLand

  browserify + babelify

  @Hikaru
*/
var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('browser-sync', function() {
   browserSync({
     server: {
       baseDir: './'
     },
     open: 'external',
     port: 7070
   });
});

gulp.task('watch', function() {
  gulp.watch('./dist/**/*.js', reload);
  gulp.watch('./**/*.html', reload);
  gulp.watch('./**/*.css', reload);
});


gulp.task('default', ['watch', 'browser-sync']);
