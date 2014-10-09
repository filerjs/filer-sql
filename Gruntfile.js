/*global module:false*/
module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      options: {
        indent: 2,
        expr: true,
        unused: true,
        trailing: true,
        node: true
      },
      gruntfile: {
        src: 'gruntfile.js'
      },
      tests: {
        src: ['tests/**/*.js']
      },
      "index.js": {
        src: ['./index.js']
      },
      lib: {
        src: ['lib/**/*.js']
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          timeout: 200000
        },
        src: ['tests/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('test', [ 'jshint', 'mochaTest' ]);
};
