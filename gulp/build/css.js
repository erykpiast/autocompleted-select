'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var connect = require('gulp-connect');
var autoprefixer = require('gulp-autoprefixer');

var config = require('../config');

function buildCssTask() {
    return gulp.src(config.src.css.files)
        .pipe(sourcemaps.init())
        .pipe(sass({
            errLogToConsole: true
        }))
        .on('error', function(err) {
            gutil.log('SASS error:', err);
        })
        .pipe(autoprefixer({
            browsers: [ '> 1%', 'last 2 versions' ],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.dist.css.dir))
        .pipe(connect.reload());
};

module.exports = buildCssTask;
