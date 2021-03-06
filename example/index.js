var express = require('express');
var app     = express();
var logger    = require('yocto-logger');
var render  = require('../src/index.js')();
var _       = require('lodash');


render.updateConfig({
    app : {
      name : "test"
    },
    property : {
      title     : 'Mon titre',
      language  : 'en',
      meta      : [
        { name  : 'charset', value : 'utf-8'},
        { name  : 'fragment', value : '!' },
        { name  : 'keywords', value : 'A, B , C D E F' },
        { name  : 'description', value : 'Ma description' },
        { name  : 'og:title', value : 'My facebook title' },
      ],
      httpEquiv : [
        { name  : 'X-UA-Compatible', value : 'IE=edge' },
        { name  : 'Content-type', value : 'text/html; charset=UTF-8' }
      ],
      assets : { 
        header : {
          css : [ 
            {
              "host"        : "https://test.test.test.io",
              "link"        : "path=assets/css/aaa-bbb.cccc.css",
              "media"       : "print",
              "fingerprint" : {
                "enable"      : true,
                "key"         : "6a756d626f6472697665393735",
                "limit"       : "24",
                "qs"          : "v"
              },
              "base64"      : {
                "enable"      : true,
                "qs"          : "r"
              }
            },
            { link : 'header3.css?toto=3', media : 'media,print', fingerprint : { dateFormat : 'YY/MM/DD', enable : true, qs : 'g', limit : 15, key : "1234" } },
            { link : 'header2.css', media : 'print', fingerprint : { dateFormat : 'YY/MM/DD', enable : true, qs : 'g', limit : 15, key : "1234" } }
          ],
          js : [
             { link : 'header.js'  }, 
             { link : 'header2.js', defer : 'defer',
                "base64"      : {
                "enable"      : true,
                "qs"          : "r"
              } },
             { link : 'header3.js', async : 'async' }
          ]
        }, 
        footer : {
          css : [
            { link : 'footer.css', media : 'print' },
            { link : 'footer2.css', media : 'screen' }
          ],
          js : [
             { link : 'footer.js'  },
             { link : 'footer2.js', defer : 'defer' },
             { link : 'footer3.js', async : 'async' }
          ]
        }
      }
    }
  });
/**
 * enable debug for no cache rendering
 */

render.debug = true;

/**
 * Setting up express config for template
 */
app.set('view engine', 'jade');
app.set('views', './example/templates');
app.use(express.static('./example/public'));

app.locals.pretty = true;
/**
 * Assign render to use render from app
 */
app.set('render', render);

/**
 * Assign / routes on app for test
 */
app.get('/', function(req, res, next) {
  app.get('render').render(res, 'index', {});
  next();
});

/**
 * Assign /only-data-no-cache routes on app for test for only data with cache header
 */
app.get('/only-data-no-cache', function(req, res, next) {
  app.get('render').renderOnlyData(res, "a", true);
  next();
});

/**
 * Assign /only-data-no-cache-with-object routes on app for test for only data with cache header
 */
app.get('/only-data-no-cache-with-object', function(req, res, next) {
  app.get('render').renderOnlyData(res, { 
    data : 'a',
    b : {
      c : [
        {
          z : 1,
          e : 2
        }
      ]
    }
  }, true);
  next();
});

// only data with no cache header
app.get('/only-data-with-cache', function(req, res, next) {
  app.get('render').renderOnlyData(res, { data : { a : 'b' } });
  next();
});

// only data with no cache header with invalid no cache flags 
app.get('/only-data-with-cache-with-invalid-data-on-no-cache-params', function(req, res, next) {
  app.get('render').renderOnlyData(res, { data : { a : 'b' } }, { params : { p : 'r' } });
  next();
});

// listen and run app
app.listen(3000);