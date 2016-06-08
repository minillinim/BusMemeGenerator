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
                    'public/css/map.css': 'public/css/map.scss',
                    'public/css/about.css': 'public/css/about.scss',
                    'public/css/admin.css': 'public/css/admin.scss'
                }
            }
        },
        ngconstant: {
            options: {
                name: 'bus-meme.config',
                dest: 'public/js/config.js',
                constants: {
                    BusMemeConfig: grunt.file.readJSON('config/frontend_config/development.json')
                }
            },
            dev: {
                constants: {
                    BusMemeConfig: grunt.file.readJSON('config/frontend_config/development.json')
                }
            },
            qa: {
                constants: {
                    BusMemeConfig: grunt.file.readJSON('config/frontend_config/qa.json')
                }
            },
            prod: {
                constants: {
                    BusMemeConfig: grunt.file.readJSON('config/frontend_config/production.json')
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['public/js/places-autocomplete.js',
                    'public/js/address-validation.js',
                    'public/js/app.js',
                    'public/js/map.js',
                    'public/js/nav.js',
                    'public/js/meme-templates.js',
                    'public/js/time-options.js',
                    'public/js/gallery.js',
                    'public/js/about.js',
                    'public/js/admin.js',
                    'public/js/facebook-init.js',
                    'public/js/config.js',
                    'public/js/image-view.js',
                    'public/js/export.js',
                    'public/js/social-media-controller.js'
                ],
                dest: 'public/js/output.min.js'
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    'public/js/output.min.js':
                    [
                        'public/js/output.min.js'
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
                tasks: ['build:dev', 'delayed-livereload']
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
    grunt.registerTask('clean', 'Delete all the generated files', function() {
        grunt.file.delete('public/js/output.min.js');
    });

    grunt.registerTask('build:dev', [
        'scss',
        'ngconstant:dev',
        'develop',
        'concat'
    ]);
    grunt.registerTask('build:prod', [
        'clean',
        'scss',
        'ngconstant:prod',
        'concat',
        'uglify'
    ]);
    grunt.registerTask('default', [
        'build:dev',
        'watch'
    ]);
    grunt.registerTask('scss', ['sass']);

    grunt.registerTask('test', 'jasmine_node');
    grunt.loadNpmTasks('grunt-contrib-concat');

};
