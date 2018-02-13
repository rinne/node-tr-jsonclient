'use strict';

var http = undefined;
var https = undefined;

const uu = require('url');

var JsonClient = function(options) {
	if (typeof(options) !== 'object') {
		if ((options === undefined) || (options === null)) {
			options = {};
		} else {
			throw new Error("Invalid options.");
		}
	}
	var defaults = {
		timeout: undefined,
		maxResponseLength: undefined,
	};
	this.options = {
		timeout: ((options.hasOwnProperty('timeout') && (typeof(options.timeout) === 'number')) ?
				  options.timeout :
				  defaults.timeout),
		maxResponseLength: ((options.hasOwnProperty('maxResponseLength') && (typeof(options.maxResponseLength) === 'number')) ?
							options.maxResponseLength :
							defaults.maxResponseLength)
	};
};

JsonClient.prototype.c = function(url, data, extraHeaders) {
	var rv = (Promise.resolve()
			  .then(function() {
				  var rv = new Promise(function(resolve, reject) {
					  var u = uu.parse(url), p;
					  if (! (u && u.protocol)) {
						  throw new Error('Bad URL');
					  }
					  switch (u.protocol) {
					  case 'http':
						  if (! http) {
							  http = require('http');
						  }
						  p = http;
						  break;
					  case 'https':
						  if (! https) {
							  https = require('https');
						  }
						  p = https;
						  break;
					  default:
						  throw new Error('Bad protocol');
					  }
					  var json;
					  if ((data === undefined) || (data === null)) {
						  json = undefined;
					  } else {
						  if (! (data && (typeof(data) === 'object'))) {
							  throw new Error('Bad data');
						  }
						  json = JSON.stringify(data);
					  }
					  var o = {
						  hostname: u.host,
						  port: u.port,
						  path: u.path,
						  auth: u.auth,
						  method: 'xxx',
						  headers: {
							  'Host': u.host,
							  'Accept': 'application/json'
						  }
					  };
					  if (json) {
						  o.method = 'POST';
						  o.headers['Content-Type'] = 'application/json';
						  o.headers['Content-Length'] = (Buffer.from(json)).length;
					  } else {
						  o.method = 'GET';
					  }
					  if (extraHeaders) {
						  if (typeof(extraHeaders) !== 'object') {
							  throw new Error("Bad extra headers definition");
						  }
						  Object.keys(extraHeaders).forEach(function(k) {
							  if ((typeof(k) === 'string') && (typeof(extraHeaders[k]) === 'string')) {
								  o.headers[k] = extraHeaders[k];
							  } else {
								  throw new Error("Bad extra headers definition");
							  }
						  });
					  }
					  //console.log(o);
					  //console.log(json);
					  var req = p.request(o);
					  var response = function (res) {
						  resolve(res);
					  }.bind(this);
					  var error = function(e) {
						  reject(e);
					  }.bind(this);
					  req.on('response', response);
					  req.on('error', error);
					  if (json) {
						  req.write(json);
					  }
					  req.end();
				  }.bind(this));
				  return rv;
			  }.bind(this))
			  .then(function(res) {
				  var rv = new Promise(function(resolve, reject) {
					  if (res.statusCode != 200) {
						  reject(new Error('Bad HTTP code ' + res.statusCode + ' in response'));
					  }
					  var contentType = res.headers['content-type'];
					  var contentLength = res.headers['content-length'];
					  if (! contentType.match(/^(application\/json|text\/plain)(; charset=utf-?8)?$/i)) {
						  reject(new Error('Bad content type in response'));
						  return;
					  }
					  if (contentLength !== undefined) {
						  contentLength = Number.parseInt(contentLength, 10);
						  if (! (Number.isInteger(contentLength) && (contentLength >= 0))) {
							  reject(new Error('Bad content length in response'));
							  return;
						  }
						  if ((this.options.maxResponseLength !== undefined) && (contentLength > this.options.maxResponseLength)) {
							  reject(new Error('Content length exceeds configured maximum'));
							  return;
						  }
					  }
					  var body = new Buffer(0);
					  var timeoutRef = undefined;
					  data = function (data) {
						  if (body === undefined) {
							  return;
						  }
						  if ((this.options.maxResponseLength !== undefined) && ((body.length + data.length) > this.options.maxResponseLength)) {
							  body = undefined;
							  reject(new Error('Body size exceeds configured maximum'));
						  }
						  if ((contentLength !== undefined) && ((body.length + data.length) > contentLength)) {
							  body = undefined;
							  reject(new Error('Body size exceeds content length'));
						  }
						  body = Buffer.concat([ body, data ]);
					  }.bind(this);
					  var end = function() {
						  if (body === undefined) {
							  return;
						  }
						  if (timeoutRef) {
							  clearTimeout(timeoutRef);
							  timeoutRef = undefined;
						  }
						  if ((contentLength !== undefined) && (body.length != contentLength)) {
							  body = undefined;
							  reject(new Error('Truncated response body'));
						  }
						  resolve(body);
						  body = undefined;
					  }.bind(this);
					  var error = function(e) {
						  if (body === undefined) {
							  return;
						  }
						  if (timeoutRef) {
							  clearTimeout(timeoutRef);
							  timeoutRef = undefined;
						  }
						  body = undefined;
						  reject(e);
					  }.bind(this);
					  var timeout = function() {
						  console.log('timeout exceeded');
						  timeoutRef = undefined;
						  error(new Error('Timeout reading response'));
					  }.bind(this);
					  res.on('error', error);
					  res.on('data', data);
					  res.on('end', end);
					  if (this.options.timeout !== undefined) {
						  console.log('timeout set');
						  timeoutRef = setTimeout(timeout, this.options.timeout);
					  }
				  }.bind(this));
				  return rv;
			  }.bind(this))
			  .then(function(body) {
				  return JSON.parse(body);
			  }.bind(this))
			  .then(function(data) {
				  if (! (data && (typeof(data) === 'object'))) {
					  throw new Error('JSON parse does not yield an object or an array');
				  }
				  return data;
			  }.bind(this))
			  .catch(function(e) {
				  console.log(e);
				  console.log(e.stack);
				  throw e;
			  }.bind(this)));
	return rv;
};

module.exports = JsonClient;
