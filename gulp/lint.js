'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');

var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var config = require('./config');

module.exports = function lintTask(cb, files) {
    gutil.log('linting is starting...');

    return gulp.src(files || config.src.js.files)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
        .on('error', function(err) {
            gutil.log('linter error:', err.message);
        })
        .on('finish', function() {
            gutil.log('linting finished!');
        });
};
