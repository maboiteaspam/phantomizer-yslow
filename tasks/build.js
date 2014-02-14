'use strict';

module.exports = function(grunt) {

  var fs = require("fs");

  var childProcess = require('child_process');
  var phantomjs = require('phantomjs');
  var yslow = require('../lib/main.js');
  var ph_libutil = require("phantomizer-libutil");
  var url_parser = require('url');

  // yslow runner
  // ------------
  // use it for any project
  grunt.registerMultiTask("yslow",
    "Measure page loading times with YSlow", function () {

      var options = this.options({
        urls:[],

        // specify the information to display/log (basic|grade|stats|comps|all) [all]
        info:'all',
        // specify the output results format (json|xml|plain|tap|junit) [json]
        format:'json',
        // specify the YSlow performance ruleset to be used (ydefault|yslow1|yblog) [ydefault]
        ruleset:'ydefault',
        // specify an URL to log the results
        beacon:null,
        // include dictionary of results fields
        dict:null,
        // for test formats, the threshold to test scores ([0-100]|[A-F]|{JSON}) [80]
        threshold:'80',
        // specify the user agent string sent to server when the page requests resources
        ua:null,
        // specify page viewport size WxY, where W = width and H = height [400x300]
        viewport:'400x300',
        // specify custom request headers, e.g.: -ch '{"Cookie": "foo=bar"}'
        headers:null,
        // output page console messages (0: none, 1: message, 2: message + line + source) [0]
        console:'0',
        // specify comma separated list of additional CDNs
        cdns:null,
        // specify output path
        output:null,
        // produce human friendly output
        readable:false
      });

      var done = this.async();

      var urls = unique_urls(options.urls);
      grunt.log.ok("Running "+urls);

      var args = forge_yslow_args(options);

      var yslow_process = process_yslow_output(options.format,args,urls,function(responses){

        end_message(urls,responses);
        write_yslow_output(options.format,options.output,responses,options.readable);

        done();
      });
      yslow_process.stdout.on('data', function (data) {
        if(options.output=="-"){
          grunt.log.write(data.toString());
        }
      });

    });

  // yslow phantomizer
  // ------------
  // specific to phantomizer projects
  grunt.registerMultiTask("phantomizer-yslow",
    "Measure page loading times with YSlow", function () {

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
        // produce human friendly output
        readable:false,
        // specify output path
        output:null,
      });

      var web_server_paths = options.web_server_paths;
      var host = options.host;
      var port = options.port?options.port:"";
      var ssl_port = options.ssl_port?options.ssl_port:"";
      var inject_assets = options.inject_assets;

      var done = this.async();

      var urls = unique_urls(options.urls);
      grunt.log.ok("Running "+urls);
      var args = forge_yslow_args(options);

      if( host+port+ssl_port != '' ){
        // get phantomizer main instance
        var Phantomizer = ph_libutil.Phantomizer;
        var phantomizer = new Phantomizer(process.cwd(),grunt);
        phantomizer.create_webserver(web_server_paths,function(webserver){
          webserver.enable_dashboard(false);
          webserver.enable_build(false);
          webserver.enable_assets_inject(inject_assets);

          webserver.start(port, ssl_port, host);

          var yslow_process = process_yslow_output(options.format,args,urls,function(responses){

            end_message(urls,responses);
            write_yslow_output(options.format,options.output,responses,options.readable);

            webserver.stop(function(){
              done();
            });

          });
          yslow_process.stdout.on('data', function (data) {
            if(options.output=="-"){
              grunt.log.write(data.toString());
            }
          });

        });
      }
    });

  // helper functions
  // --------
  function unique_urls(urls){
    var retour = [];
    for( var n in urls ){
      if( urls[n] && retour.indexOf(urls[n]) == -1 ){
        retour.push(urls[n])
      }
    }
    return retour;
  }
  // tranforms options to --[switch] [value]
  // does not manage urls
  function forge_yslow_args(options){
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
    for( var n in options ){
      if( known_switchs.indexOf(n)>-1
        && options[n] !== undefined
        && options[n] !== null ){
        args.push("--"+n);
        args.push(options[n]);
      }
    }
    return args;
  }
  // grunt task confirmation message
  function end_message(urls,responses){
    grunt.log.ok("Parsed: "+responses.length+"/"+urls.length);

    if( urls.length !== responses.length ){
      grunt.log.error("report bug to");
      grunt.log.error("https://github.com/maboiteaspam/phantomizer-yslow/issues");
      grunt.fail.warn("could not parse correctly yslow output");
    }
  }
  // write yslow output files after console output parsing
  /**
   * if output is '-', goes to console
   * if output is null, displays nothing
   * if output is junit|tap, records results in some_output_path/report.(junit|tap)
   * otherwise, records results in some_output_path/some/url_path/url_filename.ext.(xml|json|plain)
   *
   * @param format
   * @param output
   * @param responses
   * @param readable
   */
  function write_yslow_output(format,output,responses,readable){
    if(output!="-"&&output!=null){
      if( format.match(/(junit|tap)/) ){
        var content = "";
        for(var n in responses ){
          content+=responses[n].response;
          content+="\r\n\r\n";
        }
        var filep = output+"/report."+format;
        grunt.file.delete(filep);
        grunt.file.write(filep, content);
        grunt.log.ok(filep);
      }else{
        for(var n in responses ){
          var u = url_parser.parse(responses[n].url);
          var filep = output+""+u.path+"."+format;
          var content = responses[n].response;
          if( format == "json" && readable ){
            content = JSON.stringify(JSON.parse(content),null,4)
          }
          grunt.file.write(filep, content);
          grunt.log.ok(filep);
        }
      }
    }
  }
  // calls yslow and parses its output in best way possible
  /**
   * Returns an array of objects
   *  responses = [
   *  {url:'',response:''},
   *  {url:'',response:''}
   *  ]
   *
   *  Note that junit and tap format
   *  can not match correctly request to output,
   *  thus, the url value is not reliable for those two
   *
   * @param format (xml|json|plain|tap|junit)
   * @param args []
   * @param urls []
   * @param then callback
   * @returns {*}
   */
  function process_yslow_output(format,args,urls, then){
    var responses = [];
    var current_response = "";

    for( var n in urls ){
      args.push(urls[n]);
    }
    var phantomjs_process = run_phantomjs(args,function(stderr,stdout){

      if( current_response != "" ){
        var found_url = match_yslow_response_url(format,urls,current_response);
        if( found_url == false ){
          found_url = urls[ responses.length ];
          grunt.log.error("URL not found "+found_url);
        }else{
          grunt.log.writeln("URL found "+found_url);
        }
        responses.push({url:found_url,response:current_response});
        current_response="";
      }

      if( then ) then(responses);
    });
    var formats = {
      'xml':/(<response><Date>[A-Za-z]+, [0-9]+ [A-Za-z]+ [0-9]+ [0-9]+:[0-9]+:[0-9]+ GMT\s)/,
      'json':/([}]\s)/,
      'tap':/(TAP version 13\s)/,
      'plain':/version:\s+/i,
      'junit':/(<\/testsuites>\s)/
    };
    phantomjs_process.stdout.on('data', function (data) {
      current_response+=data.toString();

      for( var f in formats ){
        if( format == f && current_response.match(formats[f]) ){
          var found_url = match_yslow_response_url(format,urls,current_response);
          if( found_url == false ){
            found_url = urls[ responses.length ];
            grunt.log.error("URL not found "+found_url);
          }else{
            grunt.log.writeln("URL found "+found_url);
          }
          responses.push({url:found_url,response:current_response});
          current_response="";

        }
      }
    });

    return phantomjs_process;
  }
  // parses and output and returns the associate url, when possible
  /**
   * tap and junit returns false
   *
   * @param format (xml|json|plain|tap|junit)
   * @param urls []
   * @param response ''
   * @returns {boolean}
   */
  function match_yslow_response_url(format,urls,response){
    var found_url = false;
    if( format == "json" ){
      var c = JSON.parse(response);
      found_url = decodeURIComponent(c.u);
    }else if( format == "xml" ){
      found_url = response.match(/<u>([^<]+)<\/u>/)[1];
    }else if( format == "plain" ){
      var t = response.match(/^.*((\r\n|\n|\r)|$)/gm);
      if(t.length > 3 && t[3].match(/url:\s+.+/) ){
        found_url = t[3].match(/url:\s+(.+)/)[1];
      }
    }
    return found_url;
  }
  // runs phantomjs and pipes output to grunt
  function run_phantomjs(args,then){

    args.unshift(yslow.path);

    var stdout = "";
    var stderr = "";

    grunt.log.write(phantomjs.path+" "+args.join(" "));
    var pantomjs_process = require('child_process').spawn(phantomjs.path, args);
    // with live output piping
    pantomjs_process.stdout.on('data', function (data) {
      stdout+=data.toString();
      grunt.verbose.write(data.toString());
    });
    pantomjs_process.stderr.on('data', function (data) {
      stderr+=data.toString();
      grunt.log.error(stderr);
    });
    // and callback on exit process
    pantomjs_process.on('exit', function (code) {
      if(then) then(stderr,stdout);
    });

    return pantomjs_process;
  }
};