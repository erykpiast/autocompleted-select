'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var glob = require('glob');
var browserify = require('browserify');
var babelify = require('babelify');
var aliasify = require('aliasify');

var config = require('../config');

var bundler = (function createBundler() {
    var bundler = browserify({
            debug: true,
            entry: true
        });

    glob.sync(config.test.files).forEach(function(filePath) {
        bundler = bundler.add(filePath);
    });

    bundler = bundler.transform(babelify.configure({
        only: /^(?!.*node_modules)+.+\.js$/,
        sourceMap: 'inline',
        sourceMapRelative: __dirname
    }))
    .transform(aliasify.configure({
        aliases: {
            'x-tag': '../../shims/x-tag.js'
        },
        configDir: __dirname
    }));

    return bundler;
})();

function buildTestsTask() {
    return bundler.bundle()
    .on('error', function(err) {
        gutil.log('Browserify error:', err.message);
    })
    .pipe(source(config.test.bundle.name))
    .pipe(gulp.dest(config.test.bundle.dir));
}

module.exports = buildTestsTask;
