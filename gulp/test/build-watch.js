'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var glob = require('glob');
var browserify = require('browserify');
var babelify = require('babelify');
var aliasify = require('aliasify');
var extend = require('extend');

var config = require('../config');


module.exports = function buildTestsTask(before, after) {
    var bundler = watchify(browserify(extend(watchify.args, {
        debug: true,
        entry: true
    })));

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
    }))
    .on('update', _build);

    function _build(changedFiles) {
        gutil.log('building is starting...');

        if(changedFiles) {
            gutil.log([ 'files to rebuild:' ].concat(changedFiles).join('\n'));
        }

        return before(changedFiles)
            .pipe(bundler.bundle())
            .on('error', function(err) {
                gutil.log('Browserify error:', err.message);
            })
            .pipe(source(config.test.bundle.name))
            .pipe(gulp.dest(config.test.bundle.dir))
            .on('finish', function() {
                gutil.log('building finished!');
            })
            .pipe(after(changedFiles));
    };

    return function() {
        return _build();
    };
};
