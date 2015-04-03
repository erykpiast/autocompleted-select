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

        customLaunchers: {
            Chrome_no_sandbox: {
                base: 'Chrome',
                flags: [ '--no-sandbox' ] // with sandbox it fails under Docker
            }
        },

        reporters: [ 'mocha' ],
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,

        //*
        singleRun: true,
        port: 9876,
        browsers: [ 'PhantomJS' ]
        /*/
        singleRun: false,
        port: process.env.PORT,
        browsers: [ ]
        //*/
    });
};