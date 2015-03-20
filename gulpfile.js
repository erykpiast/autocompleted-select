'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var runSequence = require('run-sequence');

var config = require('./gulp/config');

gulp.task('lint', require('./gulp/lint'));
gulp.task('webserver', require('./gulp/web-server'));

gulp.task('build:js', require('./gulp/build/js')(
    require('./gulp/lint').bind(null, null)
));
gulp.task('build:css', require('./gulp/build/css'));
gulp.task('_build', [ 'build:js', 'build:css' ]);
gulp.task('build', function() {
    gulp.watch(config.src.css.files, [ 'build:css' ]);
    gulp.start([ '_build' ]);
});

gulp.task('test:lint', require('./gulp/test/lint'));
gulp.task('test:build', require('./gulp/test/build'));
gulp.task('test:build-watch', require('./gulp/test/build-watch')(
    require('./gulp/test/lint').bind(null, null),
    require('./gulp/test/run').bind(null, null)
));
gulp.task('test:run', require('./gulp/test/run'));
gulp.task('test', function(cb) {
    runSequence(
        [ 'lint', 'test:lint' ],
        'test:build',
        'test:run',
        function() {
            gutil.log('test task finished');

            cb();
        }
    );
});
gulp.task('test-dev', [ 'test:build-watch' ]);

gulp.task('default', [ 'build', 'webserver' ]);
