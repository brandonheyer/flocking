module.exports = function (grunt) {
  var config = {
    browserify: {
      dist: {
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
      dist: {
        files: ['src/**/*'],
        tasks: ['browserify:dist'],
      }
    }
  };

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig(config);

  grunt.registerTask('default', ['browserify']);
  grunt.registerTask('w', ['browserify', 'watch']);
};
