var fs = require('fs');
var markdown = fs.readFileSync('./presentation.md', { encoding: 'utf8' });

markdown = markdown.replace(/```/g, '\\`\\`\\`');

module.exports = function (grunt) {
  var config = {
    replace: {
      dev: {
        options: {
          patterns: [
            {
              match: 'MARKDOWN',
              replacement: markdown
            }
          ],
        },
        files: [{
          src: ['./presentation.js'],
          dest: './src/'
        }]
      }
    },

    browserify: {
      demo: {
        src: [
          './src/**/*',
          '!./src/main.js',
          '!./src/presentation.js'
        ],
        dest: './dist/js/demo.js',
        options: {
          browserifyOptions: {
            debug: true
          },
          transform: [
            [
              'babelify',
              {
                'presets': [
                  'es2015'
                ]
              }
            ]
          ]
        }
      },

      dist: {
        src: [
          './src/**/*',
          '!./src/demo.js'
        ],
        dest: './dist/js/main.js',
        options: {
          browserifyOptions: {
            debug: true
          },
          transform: [
            [
              'babelify',
              {
                'presets': [
                  'es2015'
                ]
              }
            ]
          ]
        }
      }
    },

    watch: {
      // presentation: {
      //   files: './presentation.md',
      //   tasks: ['replace']
      // },

      // dist: {
      //   files: './src/**/*',
      //   tasks: ['browserify:dist'],
      //   options: {
      //     livereload: {
      //       host: 'localhost',
      //       port: 9000
      //     }
      //   }
      // },

      demo: {
        files: './src/**/*',
        tasks: ['browserify:demo'],
        options: {
          livereload: {
            host: 'localhost',
            port: 9000
          }
        }
      }
    }
  };

  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig(config);

  grunt.registerTask('noDemoWatch', function() {
    delete grunt.config.getRaw('watch').demo;
  });

  grunt.registerTask('noDistWatch', function() {
    var config = grunt.config.getRaw('watch');

    delete config.presentation;
    delete config.dist;
  });

  grunt.registerTask('default', ['replace', 'browserify']);
  grunt.registerTask('watch', ['replace', 'browserify:demo', 'watch']);
  grunt.registerTask('dist', ['replace', 'browserify:dist', 'noDemoWatch', 'watch']);
  grunt.registerTask('demo', ['replace', 'browserify:demo', 'noDistWatch', 'watch']);
};
