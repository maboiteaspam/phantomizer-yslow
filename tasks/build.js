'use strict';

module.exports = function(grunt) {

  var fs = require("fs");

  var childProcess = require('child_process');
  var phantomjs = require('phantomjs');
  var yslow = require('yslow');
  var ph_libutil = require("phantomizer-libutil");

  grunt.registerMultiTask("phantomizer-yslow",
    "Measure page loading times with YSlow", function () {

      var webserver           = ph_libutil.webserver;
      var router_factory      = ph_libutil.router;
      var optimizer_factory   = ph_libutil.optimizer;
      var meta_factory        = ph_libutil.meta;

      var options = this.options({
        web_server_paths:[],
        urls:[],
        host:'localhost',
        port:'',
        ssl_port:'',
        web_server_log:false,
        inject_assets:true,

        // specify the information to display/log (basic|grade|stats|comps|all) [all]
        info:null,
        // specify the output results format (json|xml|plain|tap|junit) [json]
        format:null,
        // specify the YSlow performance ruleset to be used (ydefault|yslow1|yblog) [ydefault]
        ruleset:null,
        // specify an URL to log the results
        beacon:null,
        // include dictionary of results fields
        dict:null,
        // for test formats, the threshold to test scores ([0-100]|[A-F]|{JSON}) [80]
        threshold:null,
        // specify the user agent string sent to server when the page requests resources
        ua:null,
        // specify page viewport size WxY, where W = width and H = height [400x300]
        viewport:null,
        // specify custom request headers, e.g.: -ch '{"Cookie": "foo=bar"}'
        headers:null,
        // output page console messages (0: none, 1: message, 2: message + line + source) [0]
        console:null,
        // specify comma separated list of additional CDNs
        cdns:null,

        meta_dir:''
      });

      var web_server_paths = options.web_server_paths;
      var host = options.host;
      var port = options.port?options.port:"";
      var ssl_port = options.ssl_port?options.ssl_port:"";
      var web_server_log = options.web_server_log;
      var inject_assets = options.inject_assets;

      var meta_dir = options.meta_dir;


      var done = this.async();
      var finish = function(stderr,stdout){
        if( stderr != "" ){
          grunt.log.warn( "phantomjs error" );
          grunt.log.warn( stderr );
        } else {
          grunt.log.writeln(stdout);
        }
        if(webserver.stop) webserver.stop();
        done();
      }


      var config = grunt.config.get();
      var meta_manager = new meta_factory(process.cwd(), meta_dir);
      var optimizer = new optimizer_factory(meta_manager, config, grunt);
      var router = new router_factory(config.routing);
      router.load(function(){

        if( host+port+ssl_port != '' ){
          webserver = new webserver(router,optimizer,meta_manager,grunt, web_server_paths);
          webserver.enable_dashboard(false);
          webserver.enable_build(false);
          webserver.enable_assets_inject(inject_assets);

          webserver.start(port, ssl_port, host);
        }

        grunt.log.ok("Running "+options.urls);

        var known_switchs = [
          'info',
          'format',
          'ruleset',
          'beacon',
          'dict',
          'threshold',
          'ua',
          'viewport',
          'headers',
          'console',
          'cdns'
        ];
        var args = [];
        for( var n in known_switchs ){
          if( known_switchs[n] ){
            args.push("--"+n);
            args.push(options[n]);
          }
        }
        for( var n in options.urls ){
          args.push(options.urls[n]);
        }

        run_phantomjs(args,finish);
      });

    });

  function run_phantomjs(args,then){

    args.unshift(yslow.path);

    childProcess.execFile(phantomjs.path, args, function(err, stdout, stderr) {
      if(then) then(stderr,stdout);
    })
  }
};