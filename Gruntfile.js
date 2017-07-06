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
      dev: {
        src: [
          './src/**/*'
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
      presentation: {
        files: './presentation.md',
        tasks: ['replace']
      },

      js: {
        files: './src/**/*',
        tasks: ['browserify'],
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

  grunt.registerTask('default', ['replace', 'browserify', 'watch']);
};
