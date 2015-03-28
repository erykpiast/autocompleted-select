module.exports = function (config) {
    config.set({
        basePath: '.',

        frameworks: [ 'mocha' ],
        
        client: {
            mocha: {
                ui: 'tdd'
            }
        },

        files: [ /* definition in gulpfile */ ],

        reporters: [ 'mocha' ],
        colors: true,
        logLevel: config.LOG_INFO,

        port: 9876,
        autoWatch: false,
        singleRun: true,

        browsers: [ 'PhantomJS' ]
    });
};