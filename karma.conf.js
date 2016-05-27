module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            'public/js/lib/angular.js',
            'public/js/lib/angular-mocks.js',
            'public/**/*.js'
        ],
        exclude: [
            'public/js/output.min.js',
            'public/js/places-autocomplete.js'
        ],
        reporters: ['progress'],
        port: 9876,
        colors: true,
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    })
};
