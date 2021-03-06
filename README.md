[![NPM](https://nodei.co/npm/yocto-render.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/yocto-render/)

![alt text](https://david-dm.org/yoctore/yocto-render.svg "Dependencies Status")
[![Code Climate](https://codeclimate.com/github/yoctore/yocto-render/badges/gpa.svg)](https://codeclimate.com/github/yoctore/yocto-render)
[![Test Coverage](https://codeclimate.com/github/yoctore/yocto-render/badges/coverage.svg)](https://codeclimate.com/github/yoctore/yocto-render/coverage)
[![Issue Count](https://codeclimate.com/github/yoctore/yocto-render/badges/issue_count.svg)](https://codeclimate.com/github/yoctore/yocto-render)
[![Build Status](https://travis-ci.org/yoctore/yocto-render.svg?branch=master)](https://travis-ci.org/yoctore/yocto-render)


## Overview

This module is a part of yocto node modules for NodeJS.

Please see [our NPM repository](https://www.npmjs.com/~yocto) for complete list of available tools (completed day after day).

This module manage your base template rendering, from a config file.

It provide a tool that build automatically your base template from a object config file.

## Motivation

For this module we don't have a specific motivation, we just need an utility tools for our base render process for yocto-core-stack package

## Config object

You must define a config object like this to let's yocto-render build your base template

```javascript
{
  app : {
    name : "YOUR_APP_NAME"
  },
  property : {
    title     : 'YOUR_TITLE_HERE',
    language  : 'YOUR_DEFAULT_LANG_HERE',
    meta      : [
      // SOME META HERE
      { name  : 'charset', value : 'utf-8'},
      { name  : 'fragment', value : '!' },
      { name  : 'keywords', value : 'A, B , C D E F' },
      { name  : 'description', value : 'Ma description' },
      { name  : 'og:title', value : 'My facebook title' }
      // AND MORE AND MORE
    ],
    httpEquiv : [
      // SOME HTTP EQUIV
      { name  : 'X-UA-Compatible', value : 'IE=edge' },
      { name  : 'Content-type', value : 'text/html; charset=UTF-8' }
      // AND MORE AND MORE
    ],
    assets :
      { 
        // DEFINE ASSETS FOR HEADER
        header : {
            // CSS HEADER
            css : [ 
              { link : 'header.css', media : 'media,print', fingerprint : { dateFormat : 'YY/MM/DD', enable : true, qs : 'g', limit : 15, key : "1234" } },
              { link : 'header2.css', media : 'print' }
              // AND MORE AND MORE
            ],
            // JS HEADER
            js : [
               { link : 'header.js'  }, 
               { link : 'header2.js', defer : 'defer' },
               { link : 'header3.js', async : 'async' }
               // AND MORE AND MORE
            ]
        }, 
        footer : {
            // CSS FOOTER
            css : [
              { link : 'footer.css', media : 'print' },
              { link : 'footer2.css', media : 'screen' }
            ],
            // JS FOOTER
            js : [
               { link : 'footer.js'  }, 
               { link : 'footer2.js', defer : 'defer' },
               { link : 'footer3.js', async : 'async' }
            ]
          }
      }
  },
  mobileIcons : [
    {
      rel : "a",
      sizes : "fsdfsd",
      href : "fsdfds"
    }
  ],
  social : {
    facebook : [
      {
        property : "fdsfsd",
        content  : "fsdfds"
      }
    ],
    google  : [
      {
        rel : "fdsfsd",
        href  : "fsdfds"
      }
    ]
  }
}
```

## How to use

Just do some setup for express and define our route and use it. See below :

```javascript
var express = require('express');
var app     = express();
var logger  = require('yocto-logger');
var render  = require('yocto-render')(logger);

// Define your config object here
var cobject = {}; // don't forget to put data

// update your config object
render.updateConfig(cobject);


// Setting up express config for template
app.set('view engine', 'jade');
app.set('views', './example/templates');
// yes we love beautiful html rendering
app.locals.pretty = true;

// Assign render to use render from app
app.set('render', render);

// Main route
app.get('/', function(req, res, next) {
  // render your index.jade
  app.get('render').render(res, 'index', {});
});

// /only-data-no-cache route on app for test for only data with cache header
app.get('/only-data-no-cache', function(req, res, next) {
  app.get('render').renderOnlyData(res, "a", true);
});

// /only-data-no-cache-with-object routes on app for test for only data with cache header
app.get('/only-data-no-cache-with-object', function(req, res, next) {
  app.get('render').renderOnlyData(res, { 
    data : 'foo', bar : { 
      foo : 'bar',
      bar : 'foo'
    }
  }, true);
});

// only data with no cache header
app.get('/only-data-with-cache', function(req, res, next) {
  app.get('render').renderOnlyData(res, { data : { a : 'b' } });
});

// only data with no cache header with invalid no cache flags
app.get('/only-data-with-cache-with-invalid-data-on-no-cache-params', function(req, res, next) {
  app.get('render').renderOnlyData(res, { data : { foo : 'bar' } }, { params : { foo : 'bar' } });
});

// listen and run app
app.listen(3000);
```

## Fingerprint on assets

A fingerprint can be added on assets url. Configuration will be for example :

```javascript

{
  assets :
  { 
    // DEFINE ASSETS FOR HEADER
    header : {
        // CSS HEADER
        css : [ 
          { link : 'header.css', media : 'media,print', fingerprint : { dateFormat : 'YY/MM/DD', enable : true, qs : 'g', limit : 15, key : "1234" } },
          { link : 'header2.css', media : 'print' }
          // AND MORE AND MORE
        ]
    }
  }
}
```

Fingerprint definition : 

- dateFormat : 'YYYY/MM/DD' : Use to define refresh delay of fingerprint :
  * YYYY/MM/DD : Refresh each day
  * YYYY/MM : Refresh each month
  *  YYYY : Refresh each year
  * YYYY/MM/DD hh : Refresh each hour
  * YYYY/MM/DD hh:mm : Refresh each minutes
  * YYYY/MM/DD hh:mm:ss : Refresh each seconds

- enable : true : Must be true, if false fingerprint was omit
- qs : Define wich query string to use before set the fingerprint
- limit : Define lenght of fingerprint value
- key : Encrypt key to use to build fingerprint

## Logging in tool

By Default this module include [yocto-logger](https://www.npmjs.com/package/yocto-logger) for logging. It's possible to inject in your router instance your current logger instance if is another yocto-logger instance.

## Changelog

All history is [here](https://github.com/yoctore/yocto-render/blob/master/CHANGELOG.md)