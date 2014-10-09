/*global module:false*/
module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      options: {
//        esnext: true,
        indent: 2,
        expr: true,
//        camelcase: true,
//        curly: true,
//        eqeqeq: true,
//        newcap: true,
        unused: true,
        trailing: true,
//        browser: false,
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
