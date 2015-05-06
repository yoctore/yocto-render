/**
 * Unit tests
 */
var render = require('../src/index.js');
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
      { render : '' },
      { render : 1 },
      { render : NaN },
      { render : false },
      { render : {} },
      { render : [] },
      // app + render
      { app : null, render : null},
      { app : '', render : ''},          
      { app : 1, render : 1},
      { app : NaN, render : NaN},
      { app : false, render : true},
      { app : {}, render : {}},      
      { app : [], render : []},      
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
      { render : { charset : null } },
      { render : { charset : '' } },
      { render : { charset : 1 } },      
      { render : { charset : NaN } },
      { render : { charset : false } },
      { render : { charset : {} } },
      { render : { charset : [] } },
       // title
      { render : { title : null } },
      { render : { title : '' } },
      { render : { title : 1 } },      
      { render : { title : NaN } },
      { render : { title : false } },
      { render : { title : {} } },
      { render : { title : [] } },
       // language
      { render : { language : null } },
      { render : { language : '' } },
      { render : { language : 1 } },      
      { render : { language : NaN } },
      { render : { language : false } },
      { render : { language : {} } },
      { render : { language : [] } },
       // meta
      { render : { meta : null } },
      { render : { meta : '' } },
      { render : { meta : 1 } },      
      { render : { meta : NaN } },
      { render : { meta : false } },
      { render : { meta : {} } },
      { render : { meta : [] } },
      { render : { meta : [ {} ] } },
       // httpEquiv
      { render : { httpEquiv : null } },
      { render : { httpEquiv : '' } },
      { render : { httpEquiv : 1 } },      
      { render : { httpEquiv : NaN } },
      { render : { httpEquiv : false } },
      { render : { httpEquiv : {} } },
      { render : { httpEquiv : [] } },
      { render : { httpEquiv : [ {} ] } },
       // assets
      { render : { assets : null } },
      { render : { assets : '' } },
      { render : { assets : 1 } },      
      { render : { assets : NaN } },
      { render : { assets : false } },
      { render : { assets : {} } },
      { render : { assets : [] } },
      { render : { assets : [ {} ] } },
       // assets - header
      { render : { assets : { header : null } } } ,
      { render : { assets : { header : '' } } },
      { render : { assets : { header : 1 } } },      
      { render : { assets : { header : NaN } } },
      { render : { assets : { header : false } } },
      { render : { assets : { header : {} } } },
      { render : { assets : { header : [] } } },
      { render : { assets : { header : [ {} ] } } },
       // assets - header - css
      { render : { assets : { header : { css : null } } } },
      { render : { assets : { header : { css : '' } } } },
      { render : { assets : { header : { css : 1 } } } },      
      { render : { assets : { header : { css : NaN } } } },
      { render : { assets : { header : { css : false } } } },
      { render : { assets : { header : { css : {} } } } },
      { render : { assets : { header : { css : [] } } } },
      { render : { assets : { header : { css : [ {} ] } } } },       
       // assets - header - css - subdata
      { render : { assets : { header : { css : [ { link : null, media : null } ] } } } },
      { render : { assets : { header : { css : [ { link : '', media : '' } ] } } } },
      { render : { assets : { header : { css : [ { link : 1, media : 1 } ] } } } },
      { render : { assets : { header : { css : [ { link : NaN, media : NaN } ] } } } },
      { render : { assets : { header : { css : [ { link : false, media : false } ] } } } },
      { render : { assets : { header : { css : [ { link : {}, media : {} } ] } } } },
      { render : { assets : { header : { css : [ { link : [], media : [] } ] } } } },
      { render : { assets : { header : { css : [ { link : [ {} ], media : [ {} ] } ] } } } },
       // assets - header - js
      { render : { assets : { header : { js : null } } } },
      { render : { assets : { header : { js : '' } } } },
      { render : { assets : { header : { js : 1 } } } },      
      { render : { assets : { header : { js : NaN } } } },
      { render : { assets : { header : { js : false } } } },
      { render : { assets : { header : { js : {} } } } },
      { render : { assets : { header : { js : [] } } } },
      { render : { assets : { header : { js : [ {} ] } } } },
       // assets - header - js - subdata
      { render : { assets : { header : { js : [ { link : null, media : null } ] } } } },
      { render : { assets : { header : { js : [ { link : '', media : '' } ] } } } },
      { render : { assets : { header : { js : [ { link : 1, media : 1 } ] } } } },
      { render : { assets : { header : { js : [ { link : NaN, media : NaN } ] } } } },
      { render : { assets : { header : { js : [ { link : false, media : false } ] } } } },
      { render : { assets : { header : { js : [ { link : {}, media : {} } ] } } } },
      { render : { assets : { header : { js : [ { link : [], media : [] } ] } } } },
      { render : { assets : { header : { js : [ { link : [ {} ], media : [ {} ] } ] } } } },

       // assets - footer
      { render : { assets : { footer : null } } } ,
      { render : { assets : { footer : '' } } },
      { render : { assets : { footer : 1 } } },      
      { render : { assets : { footer : NaN } } },
      { render : { assets : { footer : false } } },
      { render : { assets : { footer : {} } } },
      { render : { assets : { footer : [] } } },
      { render : { assets : { footer : [ {} ] } } },
       // assets - footer - css
      { render : { assets : { footer : { css : null } } } },
      { render : { assets : { footer : { css : '' } } } },
      { render : { assets : { footer : { css : 1 } } } },      
      { render : { assets : { footer : { css : NaN } } } },
      { render : { assets : { footer : { css : false } } } },
      { render : { assets : { footer : { css : {} } } } },
      { render : { assets : { footer : { css : [] } } } },
      { render : { assets : { footer : { css : [ {} ] } } } },       
       // assets - footer - css - subdata
      { render : { assets : { footer : { css : [ { link : null, media : null } ] } } } },
      { render : { assets : { footer : { css : [ { link : '', media : '' } ] } } } },
      { render : { assets : { footer : { css : [ { link : 1, media : 1 } ] } } } },
      { render : { assets : { footer : { css : [ { link : NaN, media : NaN } ] } } } },
      { render : { assets : { footer : { css : [ { link : false, media : false } ] } } } },
      { render : { assets : { footer : { css : [ { link : {}, media : {} } ] } } } },
      { render : { assets : { footer : { css : [ { link : [], media : [] } ] } } } },
      { render : { assets : { footer : { css : [ { link : [ {} ], media : [ {} ] } ] } } } },
       // assets - header - js
      { render : { assets : { footer : { js : null } } } },
      { render : { assets : { footer : { js : '' } } } },
      { render : { assets : { footer : { js : 1 } } } },      
      { render : { assets : { footer : { js : NaN } } } },
      { render : { assets : { footer : { js : false } } } },
      { render : { assets : { footer : { js : {} } } } },
      { render : { assets : { footer : { js : [] } } } },
      { render : { assets : { footer : { js : [ {} ] } } } },
       // assets - header - js - subdata
      { render : { assets : { footer : { js : [ { link : null, media : null } ] } } } },
      { render : { assets : { footer : { js : [ { link : '', media : '' } ] } } } },
      { render : { assets : { footer : { js : [ { link : 1, media : 1 } ] } } } },
      { render : { assets : { footer : { js : [ { link : NaN, media : NaN } ] } } } },
      { render : { assets : { footer : { js : [ { link : false, media : false } ] } } } },
      { render : { assets : { footer : { js : [ { link : {}, media : {} } ] } } } },
      { render : { assets : { footer : { js : [ { link : [], media : [] } ] } } } },
      { render : { assets : { footer : { js : [ { link : [ {} ], media : [ {} ] } ] } } } },       
             
    ];
 
     tests.forEach(function(test) { 
      it('Using on current render this config : ' + util.inspect(test, { depth : null }), function() {    
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
       // charset
      { render : { charset : 'utf-8' } },
       // title
      { render : { title : 'my title' } },
       // language
      { render : { language : 'en' } },
       // meta
      { render :{ meta : [ { name  : 'fragment', value : '!' }, { name  : 'keywords', value : 'A, B , C D E F' }, { name  : 'description', value : 'Ma description' }, { name  : 'og:title', value : 'My facebook title' } ] } },
       // httpEquiv
      { render : { httpEquiv : [ { name  : 'X-UA-Compatible', value : 'IE=edge' }, { name  : 'Content-type', value : 'text/html; charset=UTF-8' } ] } },
       // assets - header
      { render : { assets : { header : { css : [ { link : 'header.css', media : 'media,print' }, { link : 'header2.css', media : 'print' } ] } } } },
      { render : { assets : { header : { js : [ { link : 'header.js'  }, { link : 'header2.js', defer : 'defer' }, { link : 'header3.js', async : 'async' } ] } } } },
       // assets - header
      { render : { assets : { header : { css : [ { link : 'footer.css', media : 'media,print' }, { link : 'footer2.css', media : 'screen' } ] } } } },
      { render : { assets : { header : { js : [ { link : 'footer.js'  }, { link : 'footer2.js', defer : 'defer' }, { link : 'footer3.js', async : 'async' } ] } } } }
    ];
 
     tests.forEach(function(test) { 
      it('Using on current render this config : ' + util.inspect(test, { depth : null }), function() {    
        assert.equal(render.updateConfig(test), true);      
      });
    });    
  });
    
  describe('updateConfig() must return true with those config', function() {
  
  });   
});