'use strict';

var should = require('should');
var grunt = require('grunt');
var http = require('http');
var express = require('express');
var log = require('npmlog');

log.level = "silent";
log.level = "info";

var www_dir = __dirname + '/www';
var app_server;

describe('phantomizer-yslow tests', function () {

  before(function(){
    var app = express();
    if( log.level !== "silent" ) app.use(express.logger());
    app.use(express.static(www_dir));
    app_server = http.createServer(app).listen(8080);
  });

  after(function(done){
    grunt.file.delete("output/");
    app_server.close(done);
  });

  it('should expose the wrappers path correctly', function() {
    var loadreport = require("../lib/main.js");
    for( var n in loadreport ){
      grunt.file.exists(loadreport[n]).should.be.eql(true,n+' has wrong file path : '+loadreport[n]);
      grunt.file.read(loadreport[n]).length.should.be.greaterThan(0,n+' is an empty file : '+loadreport[n]);
    }
  });
  var url = "http://localhost:8080/index.html";
  it('should display the output', function(done) {
    var loadreport = require("../lib/main.js");
    run_phantomjs([loadreport.path, url],function(code,stdout,stderr){
      stdout.should.match(/(DOMContentLoaded)/);
      stdout.should.match(/(onload)/);
      stdout.should.match(/(Elapsed load time:\s+[0-9]+ms)/);
      done();
    });
  });

});

var phantomjs = require('phantomjs');
function run_phantomjs(args,cb){
  var stdout = "";
  var stderr = "";
  var phantomjs_process = require('child_process').spawn(phantomjs.path, args);
  phantomjs_process.stdout.on('data', function (data) {
    log.info('stdout', '', data.toString());
    stdout+=data.toString();
  });
  phantomjs_process.stderr.on('data', function (data) {
    log.info('stderr', '', data.toString());
    stderr+=data.toString();
  });
  phantomjs_process.on('exit', function (code) {
    if(cb) cb(code,stdout,stderr);
  });
  return phantomjs_process;
}