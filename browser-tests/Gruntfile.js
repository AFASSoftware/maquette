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
 
_(desireds).each(function(desired, key) {
    gruntConfig.env[key] = { 
        DESIRED: JSON.stringify(desired)
    };
    gruntConfig.concurrent['test-sauce'].push('test:sauce:' + key);
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

    _(desireds).each(function(desired, key) {
            grunt.registerTask('test:sauce:' + key, ['connect', 'env:' + key, 'simplemocha:sauce']);
    });

    grunt.registerTask('test:sauce:parallel', ['connect', 'concurrent:test-sauce']);
};
