'use strict';

var should = require('should');
var grunt = require('grunt');
var http = require('http');
var express = require('express');
var log = require('npmlog');

log.level = "log";
log.level = "silent";
log.level = "info";

// phantomizer-yslow grunt task test suite
// ------
var www_dir = __dirname + '/www';
var app_server;

describe('phantomizer-yslow grunt task tests', function () {

  this.timeout(10000);

  // **Open a webserver**
  before(function(){
    // clean output
    grunt.file.delete("yslow_reports/");

    var app = express();
    if( log.level == "info" ) app.use(express.logger());
    // app.use(express.static(www_dir));
    app.use(function(req,res,next){
      var f = www_dir+req.path;
      if( grunt.file.exists(f) ){
        setTimeout(function(){
          res.send(grunt.file.read(f))
        },random_num(10,1000))
      }else{
        next();
      }
    });
    app_server = http.createServer(app).listen(8080);
  });

  // **Close the webserver**
  after(function(done){
    app_server.close(done);
  });

  // **Clean output**
  afterEach(function(){
    grunt.file.delete("yslow_reports/");
  });




  // **test grunt task, file output**
  it('should produce one file output', function(done) {
    run_grunt([
      'yslow:test_json_1_file',
    ],function(code,stdout,stderr){
      stderr.should.be.empty;
      stdout.should.match(/Running http/);
      stdout.should.match(/Parsed: 1\/1/);
      stdout.should.match(/yslow_reports\/http_localhost_8080-index[.]html[.]json/);
      stdout.should.match(/Done, without errors[.]/);

      var c = grunt.file.read("yslow_reports/http_localhost_8080-index.html.json");
      c.should.match(/http%3A%2F%2Flocalhost%3A8080%2Findex[.]html/);
      c.should.not.be.empty;
      var report = JSON.parse(c);
      report.should.have.properties([
        'v',
        'w',
        'o'
      ]);

      done();
    });
  });
  it('should produce three files output', function(done) {
    run_grunt([
      'yslow:test_json_3_files',
    ],function(code,stdout,stderr){
      stderr.should.be.empty;
      stdout.should.match(/Running http/);
      stdout.should.match(/Parsed: 3\/3/);
      stdout.should.match(/yslow_reports\/http_localhost_8080-index[.]html[.]json/);
      stdout.should.match(/yslow_reports\/http_localhost_8080-index2[.]html[.]json/);
      stdout.should.match(/yslow_reports\/http_localhost_8080-index3[.]html[.]json/);
      stdout.should.match(/Done, without errors[.]/);

      var c = grunt.file.read("yslow_reports/http_localhost_8080-index.html.json");
      c.should.match(/http%3A%2F%2Flocalhost%3A8080%2Findex[.]html/);
      c.should.not.be.empty;
      var report = JSON.parse(c);
      report.should.have.properties([
        'v',
        'w',
        'o'
      ]);

      var c2 = grunt.file.read("yslow_reports/http_localhost_8080-index2.html.json");
      c2.should.match(/http%3A%2F%2Flocalhost%3A8080%2Findex2[.]html/);
      c2.should.not.be.empty;
      var report = JSON.parse(c2);
      report.should.have.properties([
        'v',
        'w',
        'o'
      ]);

      var c3 = grunt.file.read("yslow_reports/http_localhost_8080-index3.html.json");
      c3.should.match(/http%3A%2F%2Flocalhost%3A8080%2Findex3[.]html/);
      c3.should.not.be.empty;
      var report = JSON.parse(c3);
      report.should.have.properties([
        'v',
        'w',
        'o'
      ]);

      c.should.not.eql(c2);
      c.should.not.eql(c3);
      c2.should.not.eql(c3);

      done();
    });
  });
  it('should produce two files output', function(done) {
    run_grunt([
      'yslow:test_json_duplicated_file',
    ],function(code,stdout,stderr){
      stderr.should.be.empty;
      stdout.should.match(/Running http/);
      stdout.should.match(/Parsed: 2\/2/);
      stdout.should.match(/yslow_reports\/http_localhost_8080-index[.]html[.]json/);
      stdout.should.match(/yslow_reports\/http_localhost_8080-index2[.]html[.]json/);
      stdout.should.match(/Done, without errors[.]/);

      var c = grunt.file.read("yslow_reports/http_localhost_8080-index.html.json");
      c.should.match(/http%3A%2F%2Flocalhost%3A8080%2Findex[.]html/);
      c.should.not.be.empty;
      var report = JSON.parse(c);
      report.should.have.properties([
        'v',
        'w',
        'o'
      ]);

      var c2 = grunt.file.read("yslow_reports/http_localhost_8080-index2.html.json");
      c2.should.match(/http%3A%2F%2Flocalhost%3A8080%2Findex2[.]html/);
      c2.should.not.be.empty;
      var report = JSON.parse(c2);
      report.should.have.properties([
        'v',
        'w',
        'o'
      ]);

      c.should.not.eql(c2);

      done();
    });
  });


  // **test grunt task, file output format**
  it('should produce the right file output, json', function(done) {
    run_grunt([
      'yslow:test_json_file',
    ],function(code,stdout,stderr){
      stderr.should.be.empty;
      stdout.should.match(/Running http/);
      stdout.should.match(/Parsed: 2\/2/);
      stdout.should.match(/yslow_reports\/http_localhost_8080-index[.]html[.]json/);
      stdout.should.match(/yslow_reports\/http_localhost_8080-index2[.]html[.]json/);
      stdout.should.match(/Done, without errors[.]/);

      var c = grunt.file.read("yslow_reports/http_localhost_8080-index.html.json");
      c.should.match(/http%3A%2F%2Flocalhost%3A8080%2Findex[.]html/);
      c.should.match(/http%3A%2F%2Flocalhost%3A8080%2Fcss%2Findex.css/);
      c.should.match(/http%3A%2F%2Flocalhost%3A8080%2Fjs%2Findex.js/);
      c.should.not.match(/http%3A%2F%2Flocalhost%3A8080%2Fcss%2Findex2[.]css/);
      c.should.not.match(/http%3A%2F%2Flocalhost%3A8080%2Fjs%2Findex2[.]js/);
      c.should.not.match(/http%3A%2F%2Flocalhost%3A8080%2Fcss%2Findex3[.]css/);
      c.should.not.match(/http%3A%2F%2Flocalhost%3A8080%2Fjs%2Findex3[.]js/);
      c.should.not.be.empty;
      var report = JSON.parse(c);
      report.should.have.properties([
        'v',
        'w',
        'o'
      ]);

      var c2 = grunt.file.read("yslow_reports/http_localhost_8080-index2.html.json");
      c2.should.match(/http%3A%2F%2Flocalhost%3A8080%2Findex2[.]html/);
      c2.should.match(/http%3A%2F%2Flocalhost%3A8080%2Fcss%2Findex2[.]css/);
      c2.should.match(/http%3A%2F%2Flocalhost%3A8080%2Fjs%2Findex2[.]js/);
      c2.should.not.match(/http%3A%2F%2Flocalhost%3A8080%2Fcss%2Findex3[.]css/);
      c2.should.not.match(/http%3A%2F%2Flocalhost%3A8080%2Fjs%2Findex3[.]js/);
      c2.should.not.match(/http%3A%2F%2Flocalhost%3A8080%2Fcss%2Findex[.]css/);
      c2.should.not.match(/http%3A%2F%2Flocalhost%3A8080%2Fjs%2Findex[.]js/);
      c2.should.not.be.empty;
      var report2 = JSON.parse(c);
      report2.should.have.properties([
        'v',
        'w',
        'o'
      ]);

      c.should.not.eql(c2);

      done();
    });
  });
  it('should produce the right file output, xml', function(done) {
    run_grunt([
      'yslow:test_xml_file',
    ],function(code,stdout,stderr){
      stderr.should.be.empty;
      stdout.should.match(/Running http/);
      stdout.should.match(/Parsed: 2\/2/);
      stdout.should.match(/yslow_reports\/http_localhost_8080-index[.]html[.]xml/);
      stdout.should.match(/yslow_reports\/http_localhost_8080-index2[.]html[.]xml/);
      stdout.should.match(/Done, without errors[.]/);

      var c = grunt.file.read("yslow_reports/http_localhost_8080-index.html.xml");
      c.should.match(/http:\/\/localhost:8080\/index[.]html/);
      c.should.match(/http:\/\/localhost:8080\/css\/index[.]css/);
      c.should.match(/http:\/\/localhost:8080\/js\/index[.]js/);
      c.should.not.match(/http:\/\/localhost:8080\/css\/index2[.]css/);
      c.should.not.match(/http:\/\/localhost:8080\/js\/index2[.]js/);
      c.should.not.match(/http:\/\/localhost:8080\/css\/index3[.]css/);
      c.should.not.match(/http:\/\/localhost:8080\/js\/index3[.]js/);
      c.should.not.be.empty;

      var c2 = grunt.file.read("yslow_reports/http_localhost_8080-index2.html.xml");
      c2.should.match(/http:\/\/localhost:8080\/index2[.]html/);
      c2.should.match(/http:\/\/localhost:8080\/css\/index2[.]css/);
      c2.should.match(/http:\/\/localhost:8080\/js\/index2[.]js/);
      c2.should.not.match(/http:\/\/localhost:8080\/css\/index[.]css/);
      c2.should.not.match(/http:\/\/localhost:8080\/js\/index[.]js/);
      c2.should.not.match(/http:\/\/localhost:8080\/css\/index3[.]css/);
      c2.should.not.match(/http:\/\/localhost:8080\/js\/index3[.]js/);
      c2.should.not.be.empty;

      c.should.not.eql(c2);

      done();
    });
  });
  it('should produce the right file output, plain', function(done) {
    run_grunt([
      'yslow:test_plain_file',
    ],function(code,stdout,stderr){
      stderr.should.be.empty;
      stdout.should.match(/Running http/);
      stdout.should.match(/Parsed: 2\/2/);
      stdout.should.match(/yslow_reports\/http_localhost_8080-index[.]html[.]plain/);
      stdout.should.match(/yslow_reports\/http_localhost_8080-index2[.]html[.]plain/);
      stdout.should.match(/Done, without errors[.]/);

      var c = grunt.file.read("yslow_reports/http_localhost_8080-index.html.plain");
      c.should.match(/http:\/\/localhost:8080\/index[.]html/);
      c.should.match(/http:\/\/localhost:8080\/css\/index[.]css/);
      c.should.match(/http:\/\/localhost:8080\/js\/index[.]js/);
      c.should.not.match(/http:\/\/localhost:8080\/css\/index2[.]css/);
      c.should.not.match(/http:\/\/localhost:8080\/js\/index2[.]js/);
      c.should.not.match(/http:\/\/localhost:8080\/css\/index3[.]css/);
      c.should.not.match(/http:\/\/localhost:8080\/js\/index3[.]js/);
      c.should.not.be.empty;

      var c2 = grunt.file.read("yslow_reports/http_localhost_8080-index2.html.plain");
      c2.should.match(/http:\/\/localhost:8080\/index2[.]html/);
      c2.should.match(/http:\/\/localhost:8080\/css\/index2[.]css/);
      c2.should.match(/http:\/\/localhost:8080\/js\/index2[.]js/);
      c2.should.not.match(/http:\/\/localhost:8080\/css\/index[.]css/);
      c2.should.not.match(/http:\/\/localhost:8080\/js\/index[.]js/);
      c2.should.not.match(/http:\/\/localhost:8080\/css\/index3[.]css/);
      c2.should.not.match(/http:\/\/localhost:8080\/js\/index3[.]js/);
      c2.should.not.be.empty;

      c.should.not.eql(c2);

      done();
    });
  });
  it('should produce the right file output, junit', function(done) {
    run_grunt([
      'yslow:test_junit_file',
    ],function(code,stdout,stderr){
      stderr.should.be.empty;
      stdout.should.match(/Running http/);
      stdout.should.match(/Parsed: 2\/2/);
      stdout.should.match(/yslow_reports\/report[.]junit/);
      stdout.should.match(/Done, without errors[.]/);

      var c = grunt.file.read("yslow_reports/report.junit");

      c.should.not.be.empty;

      c.should.match(/http:\/\/localhost:8080\/css\/index[.]css/);
      c.should.match(/http:\/\/localhost:8080\/js\/index[.]js/);

      c.should.match(/http:\/\/localhost:8080\/css\/index2[.]css/);
      c.should.match(/http:\/\/localhost:8080\/js\/index2[.]js/);

      done();
    });
  });
  it('should produce the right file output, tap', function(done) {
    run_grunt([
      'yslow:test_tap_file',
    ],function(code,stdout,stderr){
      stderr.should.be.empty;
      stdout.should.match(/Running http/);
      stdout.should.match(/Parsed: 2\/2/);
      stdout.should.match(/yslow_reports\/report[.]tap/);
      stdout.should.match(/Done, without errors[.]/);

      var c = grunt.file.read("yslow_reports/report.tap");

      c.should.not.be.empty;

      c.should.match(/http:\/\/localhost:8080\/css\/index[.]css/);
      c.should.match(/http:\/\/localhost:8080\/js\/index[.]js/);

      c.should.match(/http:\/\/localhost:8080\/css\/index2[.]css/);
      c.should.match(/http:\/\/localhost:8080\/js\/index2[.]js/);

      done();
    });
  });

  // **test grunt task**
  it('should provides right count of responses, json', function(done) {
    run_grunt([
      'yslow:test_json',
    ],function(code,stdout,stderr){
      stderr.should.be.empty;
      stdout.should.match(/Running http/);
      stdout.should.match(/Parsed: 2\/2/);
      stdout.should.match(/Done, without errors[.]/);
      done();
    });
  });

  it('should provides right count of responses, xml', function(done) {
    run_grunt([
      'yslow:test_xml',
    ],function(code,stdout,stderr){
      stderr.should.be.empty;
      stdout.should.match(/Running http/);
      stdout.should.match(/Parsed: 2\/2/);
      stdout.should.match(/Done, without errors[.]/);
      done();
    });
  });

  it('should provides right count of responses, plain', function(done) {
    run_grunt([
      'yslow:test_plain',
    ],function(code,stdout,stderr){
      stderr.should.be.empty;
      stdout.should.match(/Running http/);
      stdout.should.match(/Parsed: 2\/2/);
      stdout.should.match(/Done, without errors[.]/);
      done();
    });
  });

  it('should provides right count of responses, tap', function(done) {
    run_grunt([
      'yslow:test_tap',
    ],function(code,stdout,stderr){
      stderr.should.be.empty;
      stdout.should.match(/Running http/);
      stdout.should.match(/Parsed: 2\/2/);
      stdout.should.match(/Done, without errors[.]/);
      done();
    });
  });

  it('should provides right count of responses, junit', function(done) {
    run_grunt([
      'yslow:test_junit',
    ],function(code,stdout,stderr){
      stderr.should.be.empty;
      stdout.should.match(/Running http/);
      stdout.should.match(/Parsed: 2\/2/);
      stdout.should.match(/Done, without errors[.]/);
      done();
    });
  });


});

// helper functions
// ------------
function random_num(min,max){
  return ( min+Math.floor(Math.random() * (max-min)) );
}
// spawns a new phantomjs process
var phantomjs = require('phantomjs');
function run_grunt(args,cb){
  var stdout = "";
  var stderr = "";
  var grunt_process = require('child_process').spawn('grunt', args);
  // with live output piping
  grunt_process.stdout.on('data', function (data) {
    log.info('stdout', '', data.toString());
    stdout+=data.toString();
  });
  grunt_process.stderr.on('data', function (data) {
    log.info('stderr', '', data.toString());
    stderr+=data.toString();
  });
  // and callback on exit process
  grunt_process.on('exit', function (code) {
    if(cb) cb(code,stdout,stderr);
  });
  return grunt_process;
}