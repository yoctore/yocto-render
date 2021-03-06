'use strict';

var _         = require('lodash');
var uuid      = require('uuid');
var logger    = require('yocto-logger');
var joi       = require('joi');
var utils     = require('yocto-utils');
var cryptoJs  = require('crypto-js');
var moment    = require('moment');
var base64    = require('js-base64').Base64;

/**
 * A render manager utility tool.
 *
 * @class Render
 * @param {Object} logger Default logger instance
 */
function Render (logger) {
  /**
   * Default config object
   *
   * @property defaultConfig
   * @type Object
   */
  this.defaultConfig = {
    app : {
      name : [ uuid.v4(), 'new-app' ].join('-')
    },
    property : {
      title     : '',
      language  : 'en',
      meta      : [],
      assets    : {},
      httpEquiv : []
    }
  };

  /**
   * Generate internal uuid to use on default value
   *
   * @property uuid
   * @type String
   */
  this.uuid = uuid.v4();

  /**
   * Config object. a clone value of defaultConfig or customized by user
   *
   * @property config
   * @type Object
   */
  this.config = _.clone(this.defaultConfig);

  /**
   * Debug state property. if false debug mode is disabled
   *
   * @property debug
   * @type Boolean
   * @default false
   */
  this.debug = false;

  /**
   * Login property. By Default Render use his logger instance.
   * But we can set this value by a already yocto-logger instance
   */
  this.logger = logger;
}

/**
 * Build fingerprint from givent data
 *
 * @param {String} key to use for encryption
 * @param {String} dateFormat default format to use for change delay
 * @param {Number} truncate if is set builded key will truncate with given limit
 * @return {String} builded fingerprint
 */
Render.prototype.buildFingerprint = function (key, dateFormat, truncate) {
  // Default fingerpring
  var fingerprint = cryptoJs.HmacSHA256(moment().format(dateFormat), key).toString();

  // Normalize truncate value

  truncate = truncate > _.size(fingerprint) || truncate <= 0 ? _.size(fingerprint) : truncate;

  // Default statement
  return _.isNumber(truncate) ?
    _.truncate(fingerprint, {
      length   : truncate,
      omission : ''
    }) : fingerprint;
};

/**
 * Build assets (js, css) for rendering
 *
 * @param {Object} reference reference object to use
 * @param {Array} destination array to store data before parse
 * @param {String} keyLabel main label to use on template
 * @param {String} valueLabel second label to use on template
 * @param {String} stype to use on parse
 * @return {Boolean} true if all is ok false otherwise
 */
Render.prototype.buildAssetKeyValue = function (reference, destination,
  keyLabel, valueLabel, stype) {
  // Structure is correct
  if (_.has(reference, stype) && _.isArray(reference[stype]) && !_.isEmpty(reference[stype])) {
    // Parse all reference
    _.each(reference[stype], function (stt) {
      // Clone object
      var st = _.clone(stt);

      // Check
      var check = !_.isUndefined(valueLabel) ?
        _.has(st, keyLabel) && _.has(st, valueLabel) && !_.isEmpty(st[keyLabel]) &&
                  !_.isEmpty(st[valueLabel]) :
        _.has(st, keyLabel) && !_.isEmpty(st[keyLabel]);

      // End check before add
      if (check && _.isArray(destination) && !_.isUndefined(destination) &&
          !_.isNull(destination)) {
        // Need to build a fingerprint here ?
        if (_.has(st, 'base64.enable') && st.base64.enable) {
          // We need to check is an already query string exists or not in current url
          if (_.includes(st.link, [ st.base64.qs, '=' ].join(''))) {
            // Log a warning because a query params with the same name already exists
            this.logger.warning([ '[ Render.buildAssetKeyValue ] -',
              'Cannot encode ressource [', st.link, '] to base 64 because the query string [',
              st.base64.qs, '] already exists. Update your configuration and setup the base64',
              'query string to another value'
            ].join(' '));
          } else {
            // If we are here we need to build content
            st.link = [ st.base64.qs, '=', base64.encode(st.link) ].join('');
          }
        }

        // Force remove of ? chars to the next process
        if (_.startsWith(st.link, '?')) {
          // Replace
          st.link = st.link.substr(1, st.link.length);
        }

        // Append host on the begining of link
        st.link = [ st.host, st.link ].join([
          !_.startsWith(st.link, '/') && !_.startsWith(st.link, 'https') &&
          !_.startsWith(st.link, 'http') ? '/' : '',
          !_.isEmpty(st.host) && !_.isEmpty(st.link) &&
          !_.startsWith(st.link, '?') && !_.endsWith(st.link, '?') ? '?' : ''
        ].join(''));

        // Need to build a fingerprint here ?
        if (_.has(st, 'fingerprint.enable') && st.fingerprint.enable) {
          // Build qs separtor properly, so we need to check if url already include the ? separator
          var qsSeparator = _.includes(st.link, '?') ? '&' : '?';

          // Build properly link with fingerprint value

          st.link = [ st.link, qsSeparator, st.fingerprint.qs, '=',
            this.buildFingerprint(st.fingerprint.key,
              st.fingerprint.dateFormat,
              st.fingerprint.limit
            )
          ].join('');
        }

        // Remove non needed key
        delete st.fingerprint;
        delete st.base64;
        delete st.host;

        // Push if all is okay
        destination.push(st);
      }
    }.bind(this));

    // Valid statement
    return true;
  }

  // Default statement
  return false;
};

/**
 * Build simple key association for template
 *
 * @param {Object} reference reference object to use
 * @param {Array} destination array to store data before parse
 * @param {String} keyLabel main label to use on template
 * @param {String} valueLabel second label to use on template
 * @return {Boolean} true if all is ok false otherwise
 */
Render.prototype.buildSimpleKeyValue = function (reference, destination, keyLabel, valueLabel) {
  // Parse item and assign if ok
  _.each(reference, function (ref) {
    // Has ref ?? and is valid ?
    if (_.has(ref, keyLabel) && _.has(ref, valueLabel) &&
        !_.isEmpty(ref[keyLabel]) && !_.isEmpty(ref[valueLabel])) {
      // Push data
      destination.push(ref);
    }
  });

  // Default statement
  return true;
};

/**
 * Update config for rendering
 *
 * @param {Object} value value to use on config
 * @return {Boolean} true if all is ok false otherwise
 */
Render.prototype.updateConfig = function (value) {
  // Define meta rules
  var metaHttpEquivRules = joi.object().keys({
    name  : joi.string().required().not(null),
    value : joi.string().required().not(null)
  });

  // Setting css media rules
  var cssMediaRules = joi.object().keys({
    host : joi.string().uri({
      scheme : [ 'http', 'https' ]
    }).optional().empty(),
    link        : joi.string().required().not(null),
    media       : joi.string().required().not(null),
    defer       : joi.string().optional().allow('defer').not(null),
    async       : joi.string().optional().allow('async').not(null),
    fingerprint : joi.object().optional().keys({
      enable     : joi.boolean().required().default(false),
      key        : joi.string().optional().default(this.uuid),
      dateFormat : joi.string().optional().default('DD/MM/YYYY'),
      qs         : joi.string().optional().empty().default('f'),
      limit      : joi.number().optional().min(1)
    }),
    base64 : joi.object().optional().keys({
      enable : joi.boolean().required().default(false),
      qs     : joi.string().optional().empty().default('b')
    })
  });

  // Setting js media rules
  var jsMediaRules = joi.object().keys({
    host : joi.string().uri({
      scheme : [ 'http', 'https' ]
    }).optional().empty(),
    link        : joi.string().required().not(null),
    defer       : joi.string().optional().allow('defer').not(null),
    async       : joi.string().optional().allow('async').not(null),
    fingerprint : joi.object().optional().keys({
      enable     : joi.boolean().required().default(false),
      key        : joi.string().optional().default(this.uuid),
      dateFormat : joi.string().optional().default('DD/MM/YYYY'),
      qs         : joi.string().optional().empty().default('f'),
      limit      : joi.number().optional().min(1)
    }),
    base64 : joi.object().optional().keys({
      enable : joi.boolean().required().default(false),
      qs     : joi.string().optional().empty().default('b')
    })
  });

  // Setting up media type rules
  var mediaTypeRules = {
    css : joi.array().optional().min(1).items(cssMediaRules),
    js  : joi.array().optional().min(1).items(jsMediaRules)
  };

  // Setting up assets rules
  var assetsRules = {
    header : joi.object().optional().min(1).keys(mediaTypeRules),
    footer : joi.object().optional().min(1).keys(mediaTypeRules)
  };

  // Facebook twitter keys
  var facebookTwitterKeys = {
    property : joi.string().required().empty(),
    content  : joi.string().required().empty()
  };

  // Google keys
  var googleKeys = {
    rel  : joi.string().required().empty(),
    href : joi.string().required().empty()
  };

  // Setting up social keys
  var socialRules = {
    facebook : joi.array().optional().items(facebookTwitterKeys).default([]),
    twitter  : joi.array().optional().items(facebookTwitterKeys).default([]),
    google   : joi.array().optional().items(googleKeys).default([])
  };

  // Default statement
  var schema = joi.object().required().keys({
    app : joi.object().optional().min(1).keys({
      name : joi.string().required().min(3).not(null).empty()
    }),

    // Property list
    property : joi.object().optional().min(1).keys({
      title       : joi.string().optional().min(3).not(null),
      language    : joi.string().optional().length(2).not(null),
      meta        : joi.array().optional().min(1).items(metaHttpEquivRules),
      httpEquiv   : joi.array().optional().min(1).items(metaHttpEquivRules),
      assets      : joi.object().optional().min(1).keys(assetsRules),
      mobileIcons : joi.array().optional().min(1).items(
        joi.object().required().keys({
          rel   : joi.string().required().empty(),
          sizes : joi.string().required().empty(),
          href  : joi.string().required().empty()
        })
      ),
      social : joi.object().optional().min(1).keys(socialRules)
    })
  }).allow([ 'app', 'property' ]);

  // Validate rules
  var tests = joi.validate(value, schema, {
    abortEarly : false
  });

  // Has errors ?
  if (!_.isNull(tests.error)) {
    // Has some details on error ?
    if (_.has(tests.error, 'details')) {
      // Checking details data
      if (_.isArray(tests.error.details)) {
        // Parse error details
        _.each(tests.error.details, function (error) {
          // Log errors
          this.logger.warning([ '[ Render.updateConfig ] -',
            'Cannot validate given config.',
            'Error is [', error.message, '] on [',
            error.path, ']'
          ].join(' '));
        }.bind(this));
      }
    }
  } else {
    // All is ok so merge it
    _.merge(this.config, tests.value);
  }

  // Return status
  return _.isEmpty(tests.error) || _.isNull(tests.error);
};

/**
 * Build data to inject on header or footer of page
 *
 * @param {Object} type The type of rendering
 * @return {Object|Boolean} default object to return or false if an error occured
 */
Render.prototype.build = function (type) {
  // Is a valid type ?
  if (type === 'header' || type === 'footer') {
    // Build header data to inject on tempate
    var data = {
      appname  : this.config.app.name,
      title    : this.config.property.title,
      language : this.config.property.language || this.defaultConfig.property.language
    };

    // Define common items to build
    var obj = {
      css : [],
      js  : []
    };

    // Define simple rules for cheking
    var rules = [ {
      reference   : this.config.property.assets[type],
      destination : obj.css,
      keyLabel    : 'link',
      valueLabel  : 'media',
      type        : 'assets',
      stype       : 'css'
    }, {
      reference   : this.config.property.assets[type],
      destination : obj.js,
      keyLabel    : 'link',
      type        : 'assets',
      stype       : 'js'
    } ];

    // Extend obj if is header type
    if (type === 'header') {
      // Default social obj
      var socialObj = this.config.property.social || {};

      // Extend obj

      _.extend(obj, {
        metas       : [],
        httpEquiv   : [],
        mobileIcons : this.config.property.mobileIcons || [],
        facebook    : socialObj.facebook || [],
        twitter     : socialObj.twitter || [],
        google      : socialObj.google || []
      }
      );

      // Define rule for header
      var r = [
        {
          reference   : this.config.property.meta,
          destination : obj.metas,
          keyLabel    : 'name',
          valueLabel  : 'value'
        },
        {
          reference   : this.config.property.httpEquiv,
          destination : obj.httpEquiv,
          keyLabel    : 'name',
          valueLabel  : 'value'
        }
      ];

      // Merge rule
      rules.push(r);

      // Proess unique level of data in array
      rules = _.flatten(rules);
    }

    // Process rules
    _.each(rules, function (rule) {
      // Check rule and is assets ?
      if (_.has(rule, 'type') && rule.type === 'assets') {
        // Build assets
        this.buildAssetKeyValue(rule.reference, rule.destination, rule.keyLabel,
          rule.valueLabel, rule.stype);
      } else {
        // Build classic key
        this.buildSimpleKeyValue(rule.reference, rule.destination,
          rule.keyLabel, rule.valueLabel);
      }
    }.bind(this));

    // Rename key for template
    obj = utils.obj.renameKey(obj, 'css', [ 'css', _.capitalize(type) ].join(''));
    obj = utils.obj.renameKey(obj, 'js', [ 'js', _.capitalize(type) ].join(''));

    // Default statement
    return _.extend(data, obj);
  }
  this.logger.warning([ '[ Render.build ] - Cannot build data for current type. given [',
    type, '] and waiting header OR footer value' ].join(''));


  // Default statement
  return false;
};

/**
 * Main rendering function. Render tempate or only data
 *
 * @param {Object} res current response object of express
 * @param {String} template current template path to display by rendered
 * @param {Object} param current custom param to send on rendering
 * @param {Boolean} nocache true if we need to use no cache header, false otherwise
 * @param {Boolean} onlydata true if we need to send only data
 * @param {Object} data object to send if we need only data set onlydata param to true
 */
Render.prototype.processRender = function (res, template, param, nocache, onlydata, data) {
  // Setting up cache if undefined
  nocache = _.isBoolean(nocache) ? nocache : false;
  onlydata = _.isBoolean(onlydata) ? onlydata : false;

  // Use no cache header ?
  if (nocache) {
    this.noCacheHeader(res);
  }

  // Build params
  var params = _.extend(this.build('header'), this.build('footer'));

  // Is a valid param
  if (!_.isUndefined(param) && !_.isNull(param) && _.isObject(param)) {
    // Extend params with default and custom param
    _.extend(params, param);
  }

  // Is only data request
  if (!onlydata) {
    this.logger.debug([ '[ Render.processRender ] - Rendering tempate :', template ].join(' '));

    // Rendering ?
    res.render(template, params);
  } else {
    // If data is invalid set to default empty object
    data = data || {};

    // Is a valid param
    if (!_.isUndefined(param) && !_.isNull(param) && _.isObject(param)) {
      // Extend params with default and custom param
      _.extend(data, param);
    }

    // If debug mode extend data with headers data for onlyd data mode
    if (this.debug) {
      if (!_.isObject(data)) {
        data = {
          data : data
        };
      }

      // Adding header on response
      _.extend(data, {
        header : _.get(res, '_headers')
      });
    }

    this.logger.debug('[ Render.processRender ] - Rendering only data. Data sent are :', data);

    // Send data
    res.send(data).end();
  }
};

/**
 * Default render function. for template rendering
 *
 * @param {Object} res http response object
 * @param {String} template template name/path to use for display
 * @param {Object} param data to display
 * @param {Boolean} nocache true if we need no cache header, false otherwise
 * @return {Object} return the rendering temlate
 */
Render.prototype.render = function (res, template, param, nocache) {
  // Default statement
  return this.processRender(res, template, param, nocache);
};

/**
 * Wrapper data to render only data without template
 *
 * @param {Object} res http response object
 * @param {Mixed} data data to display
 * @param {Boolean} nocache true if we need no cache header, false otherwise
 * @return {Object} return the rendering temlate
 */
Render.prototype.renderOnlyData = function (res, data, nocache) {
  // Default statement
  return this.processRender(res, null, null, nocache, true, data);
};

/**
 * Default no cache header function. Set header with no cache params
 *
 * @param {Object} res http response
 * @return {Boolean} result of method
 */
Render.prototype.noCacheHeader = function (res) {
  // Res has header method ??
  if (!_.isUndefined(res.header) && _.isFunction(res.header)) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    // Valid statement
    return true;
  }

  // Default statement
  return false;
};

// Default export
module.exports = function (l) {
  // Is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ Render.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new Render(l);
};
