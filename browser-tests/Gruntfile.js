'use strict';

var _ = require('lodash');

var desireds = require('./desireds');

var gruntConfig = {
    env: {
        // dynamically filled
    },
    simplemocha: {
        sauce: {
            options: {
                timeout: 60000,
                reporter: 'spec'
            },
            src: ['test/**/*-specs.js']
        }
    },    
    concurrent: {
        'test-sauce': [], // dynamically filled
    },
		connect: {
		  server: {
		    options: {
				    port: 8000,
				    hostname: "*",
				    base: ".."
          }
		  }
		}
  };
 
Object.keys(desireds).forEach(function(key) {
    gruntConfig.env[key] = { 
      DESIRED: JSON.stringify(desireds[key])
    };
    gruntConfig.concurrent['test-sauce'].push('dotest:sauce:' + key);
});

//console.log(gruntConfig);

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig(gruntConfig);

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-concurrent');

  // Default task.
  grunt.registerTask('default', ['test:sauce:' + _(desireds).keys().first()]);

  Object.keys(desireds).forEach(function(key) {
    grunt.registerTask('dotest:sauce:' + key, ['env:' + key, 'simplemocha:sauce']);
  });

  var serialTasks = ['connect'];
  Object.keys(desireds).forEach(function (key) {
    grunt.registerTask('test:sauce:' + key, ['connect', 'env:' + key, 'simplemocha:sauce']);
    serialTasks.push('dotest:sauce:' + key);
  });

  grunt.registerTask('test:sauce:parallel', ['connect', 'concurrent:test-sauce']);

  grunt.registerTask('test:sauce:serial', serialTasks);
};
