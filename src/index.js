'use strict';

var _         = require('lodash');
var uuid      = require('uuid');
var logger    = require('yocto-logger');
var joi       = require('joi');
var utils     = require('yocto-utils');

/**
 * A render manager utility tool.
 *
 * @class Render
 */

function Render (logger) {
  /**
   * Default config object
   *
   * @property defaultConfig
   * @type Object
   */
  this.defaultConfig = {
    app     : {
      name : [ uuid.v4(), 'new-app' ].join('-')
    },
    render  : {
      title     : '',
      language  : 'en',
      meta      : [],
      assets    : {},
      httpEquiv : []
    }
  };

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
  this.debug  = false;

  /**
   * Login property. By Default Render use his logger instance.
   * But we can set this value by a already yocto-logger instance
   */
  this.logger = logger;
}

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
  // structure is correct
  if (_.has(reference, stype) && _.isArray(reference[stype]) && !_.isEmpty(reference[stype])) {

    // parse all reference
    _.each(reference[stype], function (st) {
      // check
      var check = (!_.isUndefined(valueLabel) ?
                  (_.has(st, keyLabel) && _.has(st, valueLabel) && !_.isEmpty(st[keyLabel]) &&
                  !_.isEmpty(st[valueLabel])) :
                  (_.has(st, keyLabel) && !_.isEmpty(st[keyLabel])));

      // end check before add
      if (check && _.isArray(destination) && !_.isUndefined(destination) &&
          !_.isNull(destination)) {
        // push if all is okay
        destination.push(st);
      }
    });

    // valid statement
    return true;
  }

  // default statement
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
  // parse item and assign if ok
  _.each(reference, function (ref) {
    // has ref ?? and is valid ?
    if (_.has(ref, keyLabel) && _.has(ref, valueLabel) &&
        !_.isEmpty(ref[keyLabel]) && !_.isEmpty(ref[valueLabel])) {
      // push data
      destination.push(ref);
    }
  });

  // default statement
  return true;
};

/**
 * Update config for rendering
 *
 * @param {Object} value value to use on config
 * @return {Boolean} true if all is ok false otherwise
 */
Render.prototype.updateConfig = function (value) {

  // define meta rules
  var metaHttpEquivRules = joi.object().keys({
    name  : joi.string().required().not(null),
    value : joi.string().required().not(null)
  });

  // setting css media rules
  var cssMediaRules = joi.object().keys({
    link  : joi.string().required().not(null),
    media : joi.string().required().not(null),
    defer : joi.string().optional().allow('defer').not(null),
    async : joi.string().optional().allow('async').not(null),
  });

  // setting js media rules
  var jsMediaRules = joi.object().keys({
    link  : joi.string().required().not(null),
    defer : joi.string().optional().allow('defer').not(null),
    async : joi.string().optional().allow('async').not(null)
  });

  // setting up media type rules
  var mediaTypeRules = {
    css : joi.array().optional().min(1).items(cssMediaRules),
    js  : joi.array().optional().min(1).items(jsMediaRules)
  };

  // setting up assets rules
  var assetsRules = {
    header : joi.object().optional().min(1).keys(mediaTypeRules),
    footer : joi.object().optional().min(1).keys(mediaTypeRules)
  };

  // define general schema
  var schema = joi.object().keys({
    app     : joi.object().optional().min(1).keys({
      name : joi.string().required().min(3).not(null).empty()
    }),

    render  : joi.object().optional().min(1).keys({
      title     : joi.string().optional().min(3).not(null),
      language  : joi.string().optional().length(2).not(null),
      meta      : joi.array().optional().min(1).items(metaHttpEquivRules),
      httpEquiv : joi.array().optional().min(1).items(metaHttpEquivRules),
      assets    : joi.object().optional().min(1).keys(assetsRules)
    })
  });

  // validate rules
  var tests = joi.validate(value, schema, { abortEarly : false });

  // has errors ?
  if (!_.isNull(tests.error)) {
    // has some details on error ?
    if (_.has(tests.error, 'details')) {
      // checking details data
      if (_.isArray(tests.error.details)) {

        // parse error details
        _.each(tests.error.details, function (error) {
          // log errors
          this.logger.warning([ '[ Render.updateConfig ] -',
                                'Cannot validate given config.',
                                'Error is [', error.message, '] on [',
                                error.path, ']'
                              ].join(' '));
        }, this);
      }
    }
  } else {
    // all is ok so merge it
    _.merge(this.config, value);
  }

  // return status
  return _.isEmpty(tests.error) || _.isNull(tests.error);
};

/**
 * Build data to inject on header or footer of page
 *
 * @return {Object|Boolean} default object to return or false if an error occured
 */
Render.prototype.build = function (type) {

  // is a valid type ?
  if (type === 'header' || type === 'footer') {
    // build header data to inject on tempate
    var data = {
      appname   : this.config.app.name,
      title     : this.config.render.title,
      language  : (this.config.render.language || this.defaultConfig.render.language),
    };

    // define common items to build
    var obj = {
      css : [],
      js  : []
    };

    // define simple rules for cheking
    var rules = [ {
      reference   : this.config.render.assets[type],
      destination : obj.css,
      keyLabel    : 'link',
      valueLabel  : 'media',
      type        : 'assets',
      stype       : 'css'
    }, {
      reference   : this.config.render.assets[type],
      destination : obj.js,
      keyLabel    : 'link',
      type        : 'assets',
      stype       : 'js'
    } ];

    // extend obj if is header type
    if (type === 'header') {
      _.extend(obj, { metas : [], httpEquiv : [] });

      // define rule for header
      var r = [ {
        reference   : this.config.render.meta,
        destination : obj.metas,
        keyLabel    : 'name',
        valueLabel  : 'value'
      }, {
        reference   : this.config.render.httpEquiv,
        destination : obj.httpEquiv,
        keyLabel    : 'name',
        valueLabel  : 'value'
      } ];

      // merge rule
      rules.push(r);
      // proess unique level of data in array
      rules = _.flatten(rules);
    }

    // process rules
    _.each(rules, function (rule) {
      // check rule and is assets ?
      if (_.has(rule, 'type') && rule.type === 'assets') {
        // build assets
        this.buildAssetKeyValue(rule.reference, rule.destination, rule.keyLabel,
                                rule.valueLabel, rule.stype);
      } else {
        // build classic key
        this.buildSimpleKeyValue(rule.reference, rule.destination,
                                 rule.keyLabel, rule.valueLabel);
      }
    }, this);

    // rename key for template
    obj = utils.obj.renameKey(obj, 'css', [ 'css', _.capitalize(type) ].join(''));
    obj = utils.obj.renameKey(obj, 'js', [ 'js', _.capitalize(type) ].join(''));

    // statement
    return _.extend(data, obj);
  } else {
    this.logger.warning([ '[ Render.build ] - Cannot build data for current type. given [',
                          type, '] and waiting header OR footer value'].join(''));
  }

  // default statement
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
  // setting up cache if undefined
  nocache   = _.isBoolean(nocache) ? nocache : false;
  onlydata  = _.isBoolean(onlydata) ? onlydata : false;

  // use no cache header ?
  if (nocache) {
    this.noCacheHeader(res);
  }

  // build params
  var params = _.extend(this.build('header'), this.build('footer'));

  // is a valid param
  if (!_.isUndefined(param) && !_.isNull(param) && _.isObject(param)) {
    // extend params with default and custom param
    _.extend(params, param);
  }

  // is only data request
  if (!onlydata) {
    this.logger.debug([ '[ Render.processRender ] - Rendering tempate :', template ].join(' '));
    // rendering ?
    res.render(template, params);
  } else {
    // if data is invalid set to default empty object
    data = data || {};

    // is a valid param
    if (!_.isUndefined(param) && !_.isNull(param) && _.isObject(param)) {
      // extend params with default and custom param
      _.extend(data, param);
    }

    // if debug mode extend data with headers data for onlyd data mode
    if (this.debug) {
      if (!_.isObject(data)) {
        data = { data : data };
      }

      // adding header on response
      _.extend(data, { header : res._headers });
    }

    this.logger.debug('[ Render.processRender ] - Rendering only data. Data sent are :', data);
    // send data
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
 */
Render.prototype.render = function (res, template, param, nocache) {
  // default statement
  return this.processRender(res, template, param, nocache);
};

/**
 * Wrapper data to render only data without template
 *
 * @param {Object} res http response object
 * @param {Mixed} data data to display
 * @param {Boolean} nocache true if we need no cache header, false otherwise
 */
Render.prototype.renderOnlyData = function (res, data, nocache) {
  // default statement
  return this.processRender(res, null, null, nocache, true, data);
};

/**
 * Default no cache header function. Set header with no cache params
 *
 * @param {Object} res http response
 */
Render.prototype.noCacheHeader = function (res) {
  // res has header method ??
  if (!_.isUndefined(res.header) && _.isFunction(res.header)) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    // valid statement
    return true;
  }

  // default statement
  return false;
};

// Default export
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ Render.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }

  // default statement
  return new (Render)(l);
};
