'use strict';
var amdclean    = require('amdclean')
,   path        = require('path')

module.exports = function(grunt) {

    // https://github.com/umdjs/umd/blob/master/returnExports.js
    function AMD_to_UMD_returnExports(data) {
        var src     = path.join(grunt.config('paths.requirejs.build'), data.path)
        ,   dest    = path.join(grunt.config('paths.dist'), data.path)
        ,   start   = grunt.file.read(grunt.config('paths.wrap.start'))
        ,   end     = grunt.file.read(grunt.config('paths.wrap.end'))
        grunt.file.write(dest, amdclean.clean({
            filePath: src,
            wrap: { start: start, end: end }
        }))
    }

    grunt.initConfig({

        files: {
            grunt: [
                'gruntfile.js'
            ],
            specs: [
                'src/specs/**/*.js'
            ],
            specsrunner: [
                'index.html'
            ],
            src: [
                'src/**/*.js',
                '!<%= files.specs %>'
            ]
        },

        paths: {
            requirejs: {
                base: 'src',
                config: 'src/main.js',
                build: 'build'
            },
            wrap: {
                start: 'wrap/start.js',
                end: 'wrap/end.js',
            },
            dist: 'dist'
        },

        //----------------------------------
        //
        // jshint
        //
        //----------------------------------

        jshint: {
            grunt: {
                options: {
                    jshintrc: '.jshintrc'
                },
                files: {
                    src: '<%= files.grunt %>'
                }
            },
            specs: {
                options: {
                    jshintrc: 'src/specs/.jshintrc'
                },
                files: {
                    src: '<%= files.specs %>'
                }
            },
            src: {
                options: {
                    jshintrc: 'src/.jshintrc'
                },
                files: {
                    src: '<%= files.src %>'
                }
            }
        },

        //----------------------------------
        //
        // watch
        //
        //----------------------------------

        watch: {
            grunt: {
                files: '<%= files.grunt %>',
                tasks: [
                    'jshint:grunt',
                ]
            },
            specs: {
                options: {
                    livereload: true
                },
                files: [
                    '<%= files.specs %>',
                    '<%= files.specsrunner %>',
                ],
                tasks: [
                    'jshint:specs',
                    'mocha:specs',
                ]
            },
            src: {
                options: {
                    livereload: true
                },
                files: '<%= files.src %>',
                tasks: [
                    'jshint:src',
                    'mocha:specs',
                ]
            }
        },

        //----------------------------------
        //
        // connect
        //
        //----------------------------------

        connect: {
            specs: {
                options: {
                    hostname: 'localhost',
                    port: grunt.option('connectPort') || 9000,
                    base: '.'
                }
            }
        },

        //----------------------------------
        //
        // mocha
        //
        //----------------------------------

        mocha: {
            options: {
                // requirejs will call `mocha.run()`
                run: false,
                timeout: grunt.option('timeout') || 5000
            },
            specs: {
                options: {
                    urls: [
                        'http://<%= connect.specs.options.hostname %>:<%= connect.specs.options.port %>/'
                    ],
                    reporter: 'Spec'
                }
            }
        },

        //----------------------------------
        //
        // requirejs
        //
        //----------------------------------

        requirejs: {
            dist: {
                options: {
                    baseUrl: '<%= paths.requirejs.base %>',
                    mainConfigFile: '<%= paths.requirejs.config %>',
                    dir: '<%= paths.requirejs.build %>',
                    optimize: 'none',
                // https://github.com/umdjs/umd/blob/master/returnExports.js
                    onModuleBundleComplete: AMD_to_UMD_returnExports
                }
            }
        },

        //----------------------------------
        //
        // uglify
        //
        //----------------------------------

        uglify: {
            dist: {
                options: {
                    sourceMap: true,
                },
                files: {
                    'dist/transform.min.js': ['dist/transform.js']
                }
            }
        },

        //----------------------------------
        //
        // clean
        //
        //----------------------------------

        clean: [
            'dist',
            'build'
        ]
    })

    //--------------------------------------------------------------------------
    //
    // task aliases
    //
    //--------------------------------------------------------------------------

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

    grunt.registerTask(
        'default',
        'Runs all tests and builds the project.',
        [
            'clean',
            'jshint',
            'connect:specs',
            'mocha:specs',
            'requirejs:dist',
            'uglify:dist',
        ]
    )

    grunt.registerTask(
        'dev',
        'Runs `grunt` and then watches for changes to run addtional tasks.',
        [
            'jshint',
            'connect',
            'watch',
        ]
    )
}
