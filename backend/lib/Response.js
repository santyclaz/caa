'use strict';


/**
 *	Plugin registration
 */

register.attributes = {
	name: 'Response'
};

function register(server, options, next) {
	server.decorate('request', 'success', API.success);
	server.decorate('request', 'error', API.error);
}

exports.register = register;


/**
 *	Module API
 *	TODO: consider making this NPM module
 */

var API = {
	success: function(data, meta) {
		return new Response(data, meta);
	},
	error: function(reason) {
		var response = new Response();
		response.error(reason);
		return response;
	}
};


/**
 *	Implementation
 */

function Response(data, meta) {
	this.success = true;
	this.format = Response.FORMAT_JSON;
	this.data = data;
	this.meta = {};
	this.errors = [];

	this.setMeta(meta);
}

Response.prototype.success = function(data) {
	this.success = true;
	this.errors = [];
	this.data = data;
	return this;
};
Response.prototype.error = function(reason) {
	this.success = false;
	if (reason) {
		this.errors.push(reason);
	}
	return this;
};

Response.prototype.setMeta = function(metaData) {
	var meta = metaData ? metaData : {};
	var keys = Object.keys(meta);

	this.meta = {};
	keys.forEach(function(key) {
		this.meta[key] = meta[key];
	}, this);

	return this;
};

Response.FORMAT_JSON = 'json';

