
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    yslow: {
      options:{
        readable:true,
        output:"yslow_reports"
      },

      test_json_1_file: {
        options: {
          urls:['http://localhost:8080/index.html']
        }
      },
      test_json_3_files: {
        options: {
          urls:['http://localhost:8080/index.html','http://localhost:8080/index2.html','http://localhost:8080/index3.html']
        }
      },
      test_json_duplicated_file: {
        options: {
          urls:['http://localhost:8080/index.html','http://localhost:8080/index2.html','http://localhost:8080/index2.html']
        }
      },
      test_file_path: {
        options: {
          urls:['http://localhost:8080/index.html','http://localhost:8080/some/index.html']
        }
      },

      test_json: {
        options: {
          urls:['http://localhost:8080/index.html','http://localhost:8080/index2.html'],
          output:null
        }
      },
      test_xml: {
        options: {
          urls:['http://localhost:8080/index.html','http://localhost:8080/index2.html'],
          format:"xml",
          output:null
        }
      },
      test_plain: {
        options: {
          urls:['http://localhost:8080/index.html','http://localhost:8080/index2.html'],
          format:"plain",
          output:null
        }
      },
      test_tap: {
        options: {
          urls:['http://localhost:8080/index.html','http://localhost:8080/index2.html'],
          format:"tap",
          output:null
        }
      },
      test_junit: {
        options: {
          urls:['http://localhost:8080/index.html','http://localhost:8080/index2.html'],
          format:"junit",
          output:null
        }
      },

      test_json_file: {
        options: {
          urls:['http://localhost:8080/index.html','http://localhost:8080/index2.html']
        }
      },
      test_xml_file: {
        options: {
          urls:['http://localhost:8080/index.html','http://localhost:8080/index2.html'],
          format:"xml"
        }
      },
      test_plain_file: {
        options: {
          urls:['http://localhost:8080/index.html','http://localhost:8080/index2.html'],
          format:"plain"
        }
      },
      test_tap_file: {
        options: {
          urls:['http://localhost:8080/index.html','http://localhost:8080/index2.html'],
          format:"tap"
        }
      },
      test_junit_file: {
        options: {
          urls:['http://localhost:8080/index.html','http://localhost:8080/index2.html'],
          format:"junit"
        }
      }


    },
    docco: {
      debug: {
        src: [
          'lib/main.js',
          'lib/webserver.js',
          'tasks/build.js',
          'test/grunt.js',
          'test/node_module.js'
        ],
        options: {
          layout:'linear',
          output: 'documentation/'
        }
      }
    },
    'gh-pages': {
      options: {
        base: '.',
        add: true
      },
      src: ['documentation/**']
    },
    release: {
      options: {
        npm: false, //default: true
        // true will apply the version number as the tag
        npmtag: true, //default: no tag
        tagName: '<%= version %>', //default: '<%= version %>'
        github: {
          repo: 'maboiteaspam/phantomizer-yslow',
          usernameVar: 'GITHUB_USERNAME',
          passwordVar: 'GITHUB_PASSWORD'
        }
      }
    }
  });

  grunt.loadTasks("tasks/");

  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-release');
  grunt.registerTask('cleanup-grunt-temp', [],function(){
    var wrench = require('wrench');
    wrench.rmdirSyncRecursive(__dirname + '/.grunt', !true);
    wrench.rmdirSyncRecursive(__dirname + '/documentation', !true);
  });

  // to generate and publish the docco style documentation
  // execute this
  // grunt
  grunt.registerTask('default', ['release:patch','docco','gh-pages', 'cleanup-grunt-temp']);

  // to release the project in a new version
  // use one of those commands
  // grunt --no-write -v release # test only
  // grunt release:patch
  // grunt release:minor
  // grunt release:major
  // grunt release:prerelease

};
