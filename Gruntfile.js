'use strict';

var request = require('request');

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    var reloadPort = 35729, files;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        develop: {
            server: {
                file: 'app.js'
            }
        },
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'public/css/main.css': 'public/css/main.scss',
                    'public/css/share.css': 'public/css/share.scss',
                    'public/css/gallery.css': 'public/css/gallery.scss',
                    'public/css/map.css': 'public/css/map.scss'
                }
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    'public/js/output.min.js': 
                    ['public/js/places-autocomplete.js', 
                    'public/js/address-validation.js', 
                    'public/js/map.js',
                    'public/js/meme-templates.js',
                    'public/js/time-options.js',
                    'public/js/gallery.js'
                    ]
                }
            }
        },
        jasmine_node: {
            options: {
                forceExit: true,
                match: '.',
                matchall: false,
                extensions: 'js',
                specNameMatcher: 'spec'
            },
            all: ['spec/']
        },
        watch: {
            options: {
                nospawn: true,
                livereload: reloadPort
            },
            js: {
                files: [
                    'app.js',
                    'app/**/*.js',
                    'config/*.js',
                    'public/js/*.js'
                ],
                tasks: ['build', 'delayed-livereload']
            },
            css: {
                files: [
                    'public/css/*.scss'
                ],
                options: {
                    livereload: reloadPort
                }
            },
            views: {
                files: [
                    'app/views/*.html',
                    'app/views/**/*.html',
                    'public/views/*.html'
                ],
                options: {livereload: reloadPort}
            }
        }
    });

    grunt.config.requires('watch.js.files');
    files = grunt.config('watch.js.files');
    files = grunt.file.expand(files);

    grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
        var done = this.async();
        setTimeout(function () {
            request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','), function (err, res) {
                var reloaded = !err && res.statusCode === 200;
                if (reloaded)
                    grunt.log.ok('Delayed live reload successful.');
                else
                    grunt.log.error('Unable to make a delayed live reload.');
                done(reloaded);
            });
        }, 500);
    });

    grunt.registerTask('build', [
        'scss',
        'develop',
        'uglify'
    ]);
    grunt.registerTask('default', [
        'build',
        'watch'
    ]);
    grunt.registerTask('scss', ['sass']);

    grunt.registerTask('test', 'jasmine_node');
};
