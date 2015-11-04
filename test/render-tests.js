/**
 * Unit tests
 */
var render = require('../src/index.js')();
var assert = require('assert');
var util   = require('util');

// disable console
render.logger.enableConsole(false);

// start unit tests
describe('Render()', function() {
  describe('updateConfig() must return false with those config', function() {
    // tests
    var tests = [
      // app
      { app : null },
      { app : '' },
      { app : 1 },
      { app : NaN },
      { app : false },
      { app : {} },
      { app : [] },
      // render
      { property :'' },
      { property :1 },
      { property :NaN },
      { property :false },
      { property : {} },
      { property :[] },
      // app + render
      { app : null, property :null},
      { app : '', property :''},
      { app : 1, property :1},
      { app : NaN, property :NaN},
      { app : false, property :true},
      { app : {}, property : {}},
      { app : [], property :[]},
      // app child
      { app : { name : null } },
      { app : { name : '' } },
      { app : { name : 1 } },
      { app : { name : NaN } },
      { app : { name : false } },
      { app : { name : {} } },
      { app : { name : [] } },
      // render child
      // charset
      { property : { charset : null } },
      { property : { charset : '' } },
      { property : { charset : 1 } },
      { property : { charset : NaN } },
      { property : { charset : false } },
      { property : { charset : {} } },
      { property : { charset : [] } },
      // title
      { property : { title : null } },
      { property : { title : '' } },
      { property : { title : 1 } },
      { property : { title : NaN } },
      { property : { title : false } },
      { property : { title : {} } },
      { property : { title : [] } },
      // language
      { property : { language : null } },
      { property : { language : '' } },
      { property : { language : 1 } },
      { property : { language : NaN } },
      { property : { language : false } },
      { property : { language : {} } },
      { property : { language : [] } },
      // meta
      { property : { meta : null } },
      { property : { meta : '' } },
      { property : { meta : 1 } },
      { property : { meta : NaN } },
      { property : { meta : false } },
      { property : { meta : {} } },
      { property : { meta : [] } },
      { property : { meta : [ {} ] } },
      // httpEquiv
      { property : { httpEquiv : null } },
      { property : { httpEquiv : '' } },
      { property : { httpEquiv : 1 } },
      { property : { httpEquiv : NaN } },
      { property : { httpEquiv : false } },
      { property : { httpEquiv : {} } },
      { property : { httpEquiv : [] } },
      { property : { httpEquiv : [ {} ] } },
      // assets
      { property : { assets : null } },
      { property : { assets : '' } },
      { property : { assets : 1 } },
      { property : { assets : NaN } },
      { property : { assets : false } },
      { property : { assets : {} } },
      { property : { assets : [] } },
      { property : { assets : [ {} ] } },
      // assets - header
      { property : { assets : { header : null } } },
      { property : { assets : { header : '' } } },
      { property : { assets : { header : 1 } } },
      { property : { assets : { header : NaN } } },
      { property : { assets : { header : false } } },
      { property : { assets : { header : {} } } },
      { property : { assets : { header : [] } } },
      { property : { assets : { header : [ {} ] } } },
      // assets - header - css
      { property : { assets : { header : { css : null } } } },
      { property : { assets : { header : { css : '' } } } },
      { property : { assets : { header : { css : 1 } } } },
      { property : { assets : { header : { css : NaN } } } },
      { property : { assets : { header : { css : false } } } },
      { property : { assets : { header : { css : {} } } } },
      { property : { assets : { header : { css : [] } } } },
      { property : { assets : { header : { css : [ {} ] } } } },
      // assets - header - css - subdata
      { property : { assets : { header : { css : [ { link : null, media : null } ] } } } },
      { property : { assets : { header : { css : [ { link : '', media : '' } ] } } } },
      { property : { assets : { header : { css : [ { link : 1, media : 1 } ] } } } },
      { property : { assets : { header : { css : [ { link : NaN, media : NaN } ] } } } },
      { property : { assets : { header : { css : [ { link : false, media : false } ] } } } },
      { property : { assets : { header : { css : [ { link : {}, media : {} } ] } } } },
      { property : { assets : { header : { css : [ { link : [], media : [] } ] } } } },
      { property : { assets : { header : { css : [ { link : [ {} ], media : [ {} ] } ] } } } },
      // assets - header - js
      { property : { assets : { header : { js : null } } } },
      { property : { assets : { header : { js : '' } } } },
      { property : { assets : { header : { js : 1 } } } },
      { property : { assets : { header : { js : NaN } } } },
      { property : { assets : { header : { js : false } } } },
      { property : { assets : { header : { js : {} } } } },
      { property : { assets : { header : { js : [] } } } },
      { property : { assets : { header : { js : [ {} ] } } } },
      // assets - header - js - subdata
      { property : { assets : { header : { js : [ { link : null, media : null } ] } } } },
      { property : { assets : { header : { js : [ { link : '', media : '' } ] } } } },
      { property : { assets : { header : { js : [ { link : 1, media : 1 } ] } } } },
      { property : { assets : { header : { js : [ { link : NaN, media : NaN } ] } } } },
      { property : { assets : { header : { js : [ { link : false, media : false } ] } } } },
      { property : { assets : { header : { js : [ { link : {}, media : {} } ] } } } },
      { property : { assets : { header : { js : [ { link : [], media : [] } ] } } } },
      { property : { assets : { header : { js : [ { link : [ {} ], media : [ {} ] } ] } } } },
      // assets - footer
      { property : { assets : { footer : null } } },
      { property : { assets : { footer : '' } } },
      { property : { assets : { footer : 1 } } },
      { property : { assets : { footer : NaN } } },
      { property : { assets : { footer : false } } },
      { property : { assets : { footer : {} } } },
      { property : { assets : { footer : [] } } },
      { property : { assets : { footer : [ {} ] } } },
      // assets - footer - css
      { property : { assets : { footer : { css : null } } } },
      { property : { assets : { footer : { css : '' } } } },
      { property : { assets : { footer : { css : 1 } } } },
      { property : { assets : { footer : { css : NaN } } } },
      { property : { assets : { footer : { css : false } } } },
      { property : { assets : { footer : { css : {} } } } },
      { property : { assets : { footer : { css : [] } } } },
      { property : { assets : { footer : { css : [ {} ] } } } },
      // assets - footer - css - subdata
      { property : { assets : { footer : { css : [ { link : null, media : null } ] } } } },
      { property : { assets : { footer : { css : [ { link : '', media : '' } ] } } } },
      { property : { assets : { footer : { css : [ { link : 1, media : 1 } ] } } } },
      { property : { assets : { footer : { css : [ { link : NaN, media : NaN } ] } } } },
      { property : { assets : { footer : { css : [ { link : false, media : false } ] } } } },
      { property : { assets : { footer : { css : [ { link : {}, media : {} } ] } } } },
      { property : { assets : { footer : { css : [ { link : [], media : [] } ] } } } },
      { property : { assets : { footer : { css : [ { link : [ {} ], media : [ {} ] } ] } } } },
      // assets - header - js
      { property : { assets : { footer : { js : null } } } },
      { property : { assets : { footer : { js : '' } } } },
      { property : { assets : { footer : { js : 1 } } } },
      { property : { assets : { footer : { js : NaN } } } },
      { property : { assets : { footer : { js : false } } } },
      { property : { assets : { footer : { js : {} } } } },
      { property : { assets : { footer : { js : [] } } } },
      { property : { assets : { footer : { js : [ {} ] } } } },
      // assets - header - js - subdata
      { property : { assets : { footer : { js : [ { link : null, media : null } ] } } } },
      { property : { assets : { footer : { js : [ { link : '', media : '' } ] } } } },
      { property : { assets : { footer : { js : [ { link : 1, media : 1 } ] } } } },
      { property : { assets : { footer : { js : [ { link : NaN, media : NaN } ] } } } },
      { property : { assets : { footer : { js : [ { link : false, media : false } ] } } } },
      { property : { assets : { footer : { js : [ { link : {}, media : {} } ] } } } },
      { property : { assets : { footer : { js : [ { link : [], media : [] } ] } } } },
      { property : { assets : { footer : { js : [ { link : [ {} ], media : [ {} ] } ] } } } },
    ];

     tests.forEach(function(test) { 
      it('Using on current render this config : ' + util.inspect(test, { depth : null }),
        function() {
        assert.equal(render.updateConfig(test), false);
      });
    });
  });

  describe('updateConfig() must return true with those config', function() {
    // tests
    var tests = [
      // app
      { app : {  name : 'my app name'  } },
      // render child
       // title
      { property : { title : 'my title' } },
       // language
      { property : { language : 'en' } },
       // meta
      { property : { meta : [ 
        { name  : 'fragment', value : '!' },
        { name  : 'keywords', value : 'A, B , C D E F' },
        { name  : 'description', value : 'Ma description' },
        { name  : 'og:title', value : 'My facebook title' }
      ] } },
       // httpEquiv
      { property : { httpEquiv : [
        { name  : 'X-UA-Compatible', value : 'IE=edge' },
        { name  : 'Content-type', value : 'text/html; charset=UTF-8' }
      ] } },
       // assets - header
      { property : { assets : { header : { css : [
        { link : 'header.css', media : 'media,print' },
        { link : 'header2.css', media : 'print' }
      ] } } } },
      { property : { assets : { header : { js : [
        { link : 'header.js'  }, { link : 'header2.js', defer : 'defer' },
        { link : 'header3.js', async : 'async' }
      ] } } } },
       // assets - header
      { property : { assets : { header : { css : [
        { link : 'footer.css', media : 'media,print' },
        { link : 'footer2.css', media : 'screen' }
      ] } } } },
      { property : { assets : { header : { js : [
        { link : 'footer.js'  }, { link : 'footer2.js', defer : 'defer' },
        { link : 'footer3.js', async : 'async' }
      ] } } } }
    ];

     tests.forEach(function(test) { 
      it('Using on current render this config : ' + util.inspect(test, { depth : null }),
      function() {
        assert.equal(render.updateConfig(test), true);
      });
    });
  });

  describe('updateConfig() must return true with those config', function() {

  });
});