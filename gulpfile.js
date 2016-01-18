var gulp = require('gulp');
var rimraf = require('gulp-rimraf');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('clean', function () {
    return gulp.src('./dist/*.js', {read: false}) // much faster
        .pipe(rimraf());
});

gulp.task('default', ['clean'], function () {
    gulp.src('src/fd-router.js')
        .pipe(gulp.dest('dist'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});