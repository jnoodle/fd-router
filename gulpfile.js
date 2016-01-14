var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('clean', function () {
    gulp.src('dist/*', {read: false})
        .pipe(clean())
});

gulp.task('default', ['clean'], function () {
    gulp.src('src/fd-router.js')
        .pipe(gulp.dest('dist'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});