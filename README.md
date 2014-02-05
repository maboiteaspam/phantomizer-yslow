# phantomizer-yslow v0.1.x

> YSlow support for Phantomizer project

phantomizer-yslow is a grunt task specialized
in analyzing loading performance given an url
using YSlow tool.


Find out more about YSlow

http://yslow.org/phantomjs/

Find out more about Phantomizer

http://github.com/maboiteaspam/phantomizer


#### Example config

```javascript
  {
    'yslow': {
      default: {
        options: {
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
        output:null
        }
      },
      "yahoo":{
        "options":{
        urls:['http://yahoo.cn','http://yahoo.com','http://yahoo.fr']
        }
      }
    }
  };

```


# Documentation Index

http://maboiteaspam.github.io/phantomizer-yslow/

http://maboiteaspam.github.io/phantomizer-yslow/documentation/main.html

http://maboiteaspam.github.io/phantomizer-yslow/documentation/webserver.html

http://maboiteaspam.github.io/phantomizer-yslow/documentation/build.html

http://maboiteaspam.github.io/phantomizer-yslow/documentation/node_modules.html

http://maboiteaspam.github.io/phantomizer-yslow/documentation/grunt.html


## Release History


---
