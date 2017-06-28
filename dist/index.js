/* yocto-render - A renderer utility tool for yocto core stack - V1.1.0 */

"use strict";function Render(a){this.defaultConfig={app:{name:[uuid.v4(),"new-app"].join("-")},property:{title:"",language:"en",meta:[],assets:{},httpEquiv:[]}},this.uuid=uuid.v4(),this.config=_.clone(this.defaultConfig),this.debug=!1,this.logger=a}var _=require("lodash"),uuid=require("uuid"),logger=require("yocto-logger"),joi=require("joi"),utils=require("yocto-utils"),cryptoJs=require("crypto-js"),moment=require("moment"),base64=require("js-base64").Base64;Render.prototype.buildFingerprint=function(a,b,c){var d=cryptoJs.HmacSHA256(moment().format(b),a).toString();return c=c>_.size(d)||c<=0?_.size(d):c,_.isNumber(c)?_.truncate(d,{length:c,omission:""}):d},Render.prototype.buildAssetKeyValue=function(a,b,c,d,e){return!(!_.has(a,e)||!_.isArray(a[e])||_.isEmpty(a[e]))&&(_.each(a[e],function(a){var e=_.clone(a);if((_.isUndefined(d)?_.has(e,c)&&!_.isEmpty(e[c]):_.has(e,c)&&_.has(e,d)&&!_.isEmpty(e[c])&&!_.isEmpty(e[d]))&&_.isArray(b)&&!_.isUndefined(b)&&!_.isNull(b)){var f=_.includes(e.link,"?")?"&":"?";_.has(e,"base64.enable")&&e.base64.enable&&(_.includes(e.link,[e.base64.qs,"="].join(""))?this.logger.warning(["[ Render.buildAssetKeyValue ] -","Cannot encode ressource [",e.link,"] to base 64 because the query string [",e.base64.qs,"] already exists. Update your configuration and setup the base64","query string to another value"].join(" ")):e.link=[e.base64.qs,"=",base64.encode(e.link)].join("")),_.has(e,"fingerprint.enable")&&e.fingerprint.enable&&(e.link=[e.link,f,e.fingerprint.qs,"=",this.buildFingerprint(e.fingerprint.key,e.fingerprint.dateFormat,e.fingerprint.limit)].join("")),delete e.fingerprint,delete e.base64,b.push(e)}}.bind(this)),!0)},Render.prototype.buildSimpleKeyValue=function(a,b,c,d){return _.each(a,function(a){_.has(a,c)&&_.has(a,d)&&!_.isEmpty(a[c])&&!_.isEmpty(a[d])&&b.push(a)}),!0},Render.prototype.updateConfig=function(a){var b=joi.object().keys({name:joi.string().required().not(null),value:joi.string().required().not(null)}),c=joi.object().keys({link:joi.string().required().not(null),media:joi.string().required().not(null),defer:joi.string().optional().allow("defer").not(null),async:joi.string().optional().allow("async").not(null),fingerprint:joi.object().optional().keys({enable:joi.boolean().required().default(!1),key:joi.string().optional().default(this.uuid),dateFormat:joi.string().optional().default("DD/MM/YYYY"),qs:joi.string().optional().empty().default("v"),limit:joi.number().optional().min(1)}),base64:joi.object().optional().keys({enable:joi.boolean().required().default(!1),qs:joi.string().optional().empty().default("r")})}),d=joi.object().keys({link:joi.string().required().not(null),defer:joi.string().optional().allow("defer").not(null),async:joi.string().optional().allow("async").not(null),fingerprint:joi.object().optional().keys({enable:joi.boolean().required().default(!1),key:joi.string().optional().default(this.uuid),dateFormat:joi.string().optional().default("DD/MM/YYYY"),qs:joi.string().optional().empty().default("v"),limit:joi.number().optional().min(1)}),base64:joi.object().optional().keys({enable:joi.boolean().required().default(!1),qs:joi.string().optional().empty().default("r")})}),e={css:joi.array().optional().min(1).items(c),js:joi.array().optional().min(1).items(d)},f={header:joi.object().optional().min(1).keys(e),footer:joi.object().optional().min(1).keys(e)},g={property:joi.string().required().empty(),content:joi.string().required().empty()},h={rel:joi.string().required().empty(),href:joi.string().required().empty()},i={facebook:joi.array().optional().items(g).default([]),twitter:joi.array().optional().items(g).default([]),google:joi.array().optional().items(h).default([])},j=joi.object().required().keys({app:joi.object().optional().min(1).keys({name:joi.string().required().min(3).not(null).empty()}),property:joi.object().optional().min(1).keys({title:joi.string().optional().min(3).not(null),language:joi.string().optional().length(2).not(null),meta:joi.array().optional().min(1).items(b),httpEquiv:joi.array().optional().min(1).items(b),assets:joi.object().optional().min(1).keys(f),mobileIcons:joi.array().optional().min(1).items(joi.object().required().keys({rel:joi.string().required().empty(),sizes:joi.string().required().empty(),href:joi.string().required().empty()})),social:joi.object().optional().min(1).keys(i)})}).allow(["app","property"]),k=joi.validate(a,j,{abortEarly:!1});return _.isNull(k.error)?_.merge(this.config,k.value):_.has(k.error,"details")&&_.isArray(k.error.details)&&_.each(k.error.details,function(a){this.logger.warning(["[ Render.updateConfig ] -","Cannot validate given config.","Error is [",a.message,"] on [",a.path,"]"].join(" "))}.bind(this)),_.isEmpty(k.error)||_.isNull(k.error)},Render.prototype.build=function(a){if("header"===a||"footer"===a){var b={appname:this.config.app.name,title:this.config.property.title,language:this.config.property.language||this.defaultConfig.property.language},c={css:[],js:[]},d=[{reference:this.config.property.assets[a],destination:c.css,keyLabel:"link",valueLabel:"media",type:"assets",stype:"css"},{reference:this.config.property.assets[a],destination:c.js,keyLabel:"link",type:"assets",stype:"js"}];if("header"===a){var e=this.config.property.social||{};_.extend(c,{metas:[],httpEquiv:[],mobileIcons:this.config.property.mobileIcones||[],facebook:e.facebook||[],twitter:e.twitter||[],google:e.google||[]});var f=[{reference:this.config.property.meta,destination:c.metas,keyLabel:"name",valueLabel:"value"},{reference:this.config.property.httpEquiv,destination:c.httpEquiv,keyLabel:"name",valueLabel:"value"}];d.push(f),d=_.flatten(d)}return _.each(d,function(a){_.has(a,"type")&&"assets"===a.type?this.buildAssetKeyValue(a.reference,a.destination,a.keyLabel,a.valueLabel,a.stype):this.buildSimpleKeyValue(a.reference,a.destination,a.keyLabel,a.valueLabel)}.bind(this)),c=utils.obj.renameKey(c,"css",["css",_.capitalize(a)].join("")),c=utils.obj.renameKey(c,"js",["js",_.capitalize(a)].join("")),_.extend(b,c)}return this.logger.warning(["[ Render.build ] - Cannot build data for current type. given [",a,"] and waiting header OR footer value"].join("")),!1},Render.prototype.processRender=function(a,b,c,d,e,f){d=!!_.isBoolean(d)&&d,e=!!_.isBoolean(e)&&e,d&&this.noCacheHeader(a);var g=_.extend(this.build("header"),this.build("footer"));_.isUndefined(c)||_.isNull(c)||!_.isObject(c)||_.extend(g,c),e?(f=f||{},_.isUndefined(c)||_.isNull(c)||!_.isObject(c)||_.extend(f,c),this.debug&&(_.isObject(f)||(f={data:f}),_.extend(f,{header:a._headers})),this.logger.debug("[ Render.processRender ] - Rendering only data. Data sent are :",f),a.send(f).end()):(this.logger.debug(["[ Render.processRender ] - Rendering tempate :",b].join(" ")),a.render(b,g))},Render.prototype.render=function(a,b,c,d){return this.processRender(a,b,c,d)},Render.prototype.renderOnlyData=function(a,b,c){return this.processRender(a,null,null,c,!0,b)},Render.prototype.noCacheHeader=function(a){return!(_.isUndefined(a.header)||!_.isFunction(a.header))&&(a.header("Cache-Control","private, no-cache, no-store, must-revalidate"),a.header("Expires","-1"),a.header("Pragma","no-cache"),!0)},module.exports=function(a){return(_.isUndefined(a)||_.isNull(a))&&(logger.warning("[ Render.constructor ] - Invalid logger given. Use internal logger"),a=logger),new Render(a)};