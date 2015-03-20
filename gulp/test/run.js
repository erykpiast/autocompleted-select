'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var karma = require('gulp-karma');

var config = require('../config');

function runTestsTask() {
    return gulp.src([].concat(
            config.test.runtimeFiles,
            [ config.test.bundle.dir + '/' + config.test.bundle.name ]
        ))
        .pipe(karma({
            configFile: config.test.runnerConfig,
            action: 'run'
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            gutil.log('Karma error:', err.message);
        });
};

module.exports = runTestsTask;
