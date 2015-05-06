# Yocto Render
---------------

This module manage. your own rendering request

It's a custom render wrapper to display default template value for a website

---------------

You can initialize your render wrapper with our custom data.

### Example : 


```javascript
var render  = require('yocto-render');
// setting config
render.set('config', {
    app : {
      name : "test"
    },
    render : {
      title     : 'Mon titre',
      language  : 'en',
      meta      : [
        { name  : 'charset', value : 'utf-8'},             
        { name  : 'fragment', value : '!' },
        { name  : 'keywords', value : 'A, B , C D E F' },        
        { name  : 'description', value : 'Ma description' },
        { name  : 'og:title', value : 'My facebook title' },                
      ],
      httpEquiv : [
        { name  : 'X-UA-Compatible', value : 'IE=edge' },
        { name  : 'Content-type', value : 'text/html; charset=UTF-8' }
      ],
      assets :
        { 
          header : {
              css : [ 
                { link : 'header.css', media : 'media,print' },
                { link : 'header2.css', media : 'print' }
              ],
              js : [
                 { link : 'header.js'  }, 
                 { link : 'header2.js', defer : 'defer' },
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
```

### Result : 

_(We use a jade template : http://jade-lang.com/)_

#### Jade template

```html
doctype html
html(lang=language)
  head
    base(href='/')
    //- for pre-rendering for SEO
    title=title
    each meta in metas
      meta(name=meta.name, content=meta.value)    
    each httpe in httpEquiv
      meta(http-equiv=httpe.name, content=httpe.value)
    each hcss in cssHeader
      link(rel="stylesheet", href=hcss.link, type="text/css", media=hcss.media)
    each hjs in jsHeader
      script(src=hjs.link, type="text/javascript", defer=hjs.defer, async=hjs.async)
  body
    each fcss in cssFooter
      link(rel="stylesheet" href=fcss.link type="text/css" media=fcss.media)
    each fjs in jsFooter
      script(src=fjs.link type="text/javascript")
 
```

#### HTML Output

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <base href="/">
    <title>Mon titre</title>
    <meta name="charset" content="utf-8">
    <meta name="fragment" content="!">
    <meta name="keywords" content="A, B , C D E F">
    <meta name="description" content="Ma description">
    <meta name="og:title" content="My facebook title">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-type" content="text/html; charset=UTF-8">
    <link rel="stylesheet" href="header.css" type="text/css" media="media,print">
    <link rel="stylesheet" href="header2.css" type="text/css" media="print">
    <script src="header.js" type="text/javascript"></script>
    <script src="header2.js" type="text/javascript" defer="defer"></script>
    <script src="header3.js" type="text/javascript" async="async"></script>
  </head>
  <body>
    <link rel="stylesheet" href="footer.css" type="text/css" media="print">
    <link rel="stylesheet" href="footer2.css" type="text/css" media="screen">
    <script src="footer.js" type="text/javascript"></script>
    <script src="footer2.js" type="text/javascript"></script>
    <script src="footer3.js" type="text/javascript"></script>
  </body>
</html>
```

### Unit tests build and passed with  : 

* Mocha
* Grunt-mocha

Tests can be found on test directory

---------

### Examples : 

Example can be found on example directory

---------

For more details on these dependencies read links below :
* LodAsh : https://lodash.com/
* uuid : https://www.npmjs.com/package/uuid
* yocto-logger : git+ssh://lab.yocto.digital/yocto-node-modules/yocto-render.git
* yocto-utils :  git+ssh://lab.yocto.digital/yocto-node-modules/yocto-utils.git
* joi : https://github.com/hapijs/joi
