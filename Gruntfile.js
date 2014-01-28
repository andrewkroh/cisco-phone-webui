module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    /**
     * Read in our `package.json` file so we can access the package name and
     * version. It's already there, so we don't repeat ourselves here.
     */
    pkg: grunt.file.readJSON('package.json'),

    app_files: {
      // Relative to vendor directory:
      vendor_js: ['vendor/angular/angular.js',
                  'vendor/angular-bootstrap/ui-bootstrap-tpls.js',
                  'vendor/angular-resource/angular-resource.js',
                  'vendor/angular-route/angular-route.js'],
      vendor_js_dev: ['vendor/angular-mocks/angular-mocks.js'],
      vendor_css: ['vendor/bootstrap/dist/css/bootstrap.css'],
    },
    clean: {
      dev: {
        src: ['build/dev/**/*']
      },
      prod: {
        src: ['build/prod/**/*', 'build/.tmp/**/*']
      }
    },
    connect: {
      dev: {
        options: {
          port: 8000,
          livereload: true,
          open: {
            target: 'http://localhost:8000/build/dev'
          }  
        }
      },
      prod: {
        options: {
          port: 8000,
          livereload: true,
          open: {
            target: 'http://localhost:8000/build/prod'
          }  
        }
      }
    },
    // Compiles HTML templates into JS so that they are
    // are loaded eagerly with the scripts. (Gives you runtime
    // performance at cost of slower initial loading.)
    html2js: {
      app: {
        options: {
          // Base prefix to strip from module identifier:
          base: 'src/app'
        },
        src: ['src/app/**/*.tpl.html'],
        dest: 'build/dev/assets/js/templates-app.js'
      },
      common: {
        options: {
          // Base prefix to strip from module identifier:
          base: 'src/common'
        },
        src: ['src/common/**/*.tpl.html'],
        dest: 'build/dev/assets/js/templates-common.js'
      }
    },
    copy: {
      js: {
        files: [
          { 
            src: ['**/*.js', '!**/*.spec.js'],
            dest: 'build/dev/assets/js',
            cwd: 'src/app',
            expand: true
          },
          { 
            src: ['common/**/*.js', '!common/**/*.spec.js'],
            dest: 'build/dev/assets/js',
            cwd: 'src',
            expand: true
          }
       ]   
      },    
      assets: {
        files: [
          { 
            src: ['**/*.png'],
            dest: 'build/dev/assets',
            cwd: 'src/assets',
            expand: true,
          }
        ]   
      },
      vendor_js: {
        files: [
          { 
            src: '<%= app_files.vendor_js %>',
            dest: 'build/dev',
            expand: true,
          }
       ]   
      },
      vendor_js_dev: {
        files: [
          { 
            src: '<%= app_files.vendor_js_dev %>',
            dest: 'build/dev',
            expand: true,
          }
       ]   
      },
      vendor_css: {
        files: [
          { 
            src: '<%= app_files.vendor_css %>',
            dest: 'build/dev',
            expand: true,
          }
       ]   
      },
      /**
       * Copy any additional resources from dev to prod.
       */
      dev_to_prod: {
        files: [
          { 
            src: ['**/*.png'],
            dest: 'build/prod',
            cwd: 'build/dev',
            expand: true,
          }
       ]   
      }
    },
    less: {
      dev: {
        options: {
          paths: [ 'src/less' ]
        },
        files: {
          'build/dev/assets/css/main.css': 'src/less/main.less'
        }
      },
      prod: {
        options: {
          paths: [ 'src/less' ],
          cleancss: true
        },
        files: {
          'build/.tmp/assets/css/main.css': 'src/less/main.less'
        }
      }
    },
    concat: {
      js: {
        src: [
          '<%= app_files.vendor_js %>',
          'build/dev/assets/js/**/*.js',
          '!build/dev/assets/js/**/*.dev.js',
        ],
        dest: 'build/prod/assets/js/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },
    cssmin: {
      minify: {
        options: {
          banner: '/* <%= pkg.name %>-<%= pkg.version %> */',
          // Strip all comments:
          keepSpecialComments: 0
        },
        files: {
          'build/prod/assets/css/<%= pkg.name %>-<%= pkg.version %>.css': [
            '<%= app_files.vendor_css %>',
            'build/.tmp/assets/css/**/*.css'
          ]
        }
      }
    },
    /**
     * Minify the concatenated javascript file.
     */
    uglify: {
      js: {
        options: {
          banner: '/* <%= pkg.name %>-<%= pkg.version %> */'
        },
        files: {
          '<%= concat.js.dest %>': '<%= concat.js.dest %>'
        }
      }
    },
    index: {
      /**
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the `<head>` of `index.html`. The
       * `src` property contains the list of included files.
       */
      dev: {
        dir: 'build/dev',
        index: 'src/index.html',
        src: [
          '<%= app_files.vendor_js %>',
          '<%= app_files.vendor_js_dev %>',
          'build/dev/assets/js/**/*.js',
          '<%= app_files.vendor_css %>',
          'build/dev/assets/css/**/*.css'
        ]
      },

      /**
       * When it is time to have a completely compiled application, we can
       * alter the above to include only a single JavaScript and a single CSS
       * file. Now we're back!
       */
      prod: {
        dir: 'build/prod',
        index: 'src/index.html',
        src: [
          'build/prod/assets/js/**/*.js',
          'build/prod/assets/css/**/*.css'
        ]
      }
    },
    jshint: {
      files: ['src/**/*.js'],
    },
    watch: {
      options: {
        livereload: true,
      },
      html: {
        files: ['src/index.html'],
        tasks: ['index:dev']
      },
      html_app_templates: {
        files: ['src/app/**/*.tpl.html'],
        tasks: ['html2js:app']
      },
      html_common_templates: {
        files: ['src/common/**/*.tpl.html'],
        tasks: ['html2js:common']
      },
      js: {
        files: ['src/**/*.js', '!src/**/*.spec.js'],
        tasks: ['jshint', 'copy:js']
      },
      less: {
        files: ['src/less/*.less'],
        tasks: ['recess:dev'],
      }
    }
  });

  // Actually running things.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-html2js');

  grunt.registerMultiTask( 'index', 'Process index.html template', function () {
    /**
     * A utility function to get all app JavaScript sources.
     */
    function filterForJS ( files ) {
      return files.filter( function ( file ) {
        return file.match( /\.js$/ );
      });
    }

    /**
     * A utility function to get all app CSS sources.
     */
    function filterForCSS ( files ) {
      return files.filter( function ( file ) {
        return file.match( /\.css$/ );
      });
    }

    var dirRegex = new RegExp( '^(' + this.data.dir + ')\/', 'g' );
    var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRegex, '' );
    });
    var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRegex, '' );
    });
    var target = this.target;

    grunt.file.copy(this.data.index, this.data.dir + '/index.html', { 
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            target: target
          }
        });
      }
    });
  });

  // dev - Create a dev build that is not optimized, but is
  //       easier for debugging.
  grunt.registerTask('dev', ['clean:dev', 'jshint', 'less:dev', 
                             'html2js', 'copy', 'index:dev']);

  // prod - Transform dev build into production ready
  //        code ready for deployment.
  grunt.registerTask('prod', ['clean', 'dev', 'less:prod', 'concat',
                               'cssmin', 'uglify', 'copy:dev_to_prod',
                              'index:prod']);

  // default - Development task with livereload.
  grunt.registerTask('default', ['dev', 'connect:dev', 'watch']);
};

