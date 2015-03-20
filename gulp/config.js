'use strict';

module.exports = {
    src: {
        js: {
            files: [ './demo/index.js', './src/js/**/*.js', '!./src/js/**/spec/**/*.js' ],
            main: './demo/index.js'
        },
        css: {
            files: './src/css/**/*.scss'
        }
    },
    dist: {
        dir: './demo',
        js: {
            dir: './demo',
            bundleName: 'demo.bundle.js'
        },
        css: {
            dir: './demo'
        }
    },
    test: {
        files: './src/js/**/spec/**/*.spec.js',
        bundle: {
            name: 'tests.js',
            dir: './dist'
        },
        runtimeFiles: [ './test/**/*.js' ],
        runnerConfig: './karma.conf.js'
    }
}