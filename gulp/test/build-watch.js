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

    var building = false;
    function _build(changedFiles) {
        gutil.log('building is starting...');

        if(changedFiles) {
            gutil.log([ 'files to rebuild:' ].concat(changedFiles).join('\n'));
        }


        if(!building) {
            building = true;

            return before(changedFiles)
                .pipe(bundler.bundle())
                .pipe(source(config.test.bundle.name))
                .pipe(gulp.dest(config.test.bundle.dir))
                .pipe(after(changedFiles))
                .on('error', function(err) {
                    building = false;
                    
                    gutil.log('Building error', err.message);
                })
                .on('end', function() {
                    building = false;
                    
                    gutil.log('Building finished!');
                });
        } else {
            return null;
        }
    };

    return function() {
        return _build();
    };
};
