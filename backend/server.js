var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var Hapi = require('hapi');
var Hoek = require('hoek');


/**
 *	API
 */

module.exports = API = {
	start: start
};

var defaultOpts = {
	host: 'localhost',
	port: 7070,
	api: {
		rootDir: '',
		routesDir: 'api',
		libDir: 'lib',
		configDir: 'config',
		baseUrl: 'api'
	},
	client: {
		rootDir: 'src',
		livereload: true
	}
};


/**
 *	Methods
 */

function start(config) {
	// process options
	// TODO: clean this up, perhaps with extend or destructuring
	config = typeof config === 'object' ? config : {};
	var host = 'host' in config ? config.host : defaultOpts.host;
	var port = 'port' in config ? config.port : defaultOpts.port;

	// validation
	if (typeof port !== 'number') {
		throw Error('Invalid port "' + port + '"');
	}

	// create a server with a host and port
	var server = new Hapi.Server();
	server.connection({
		host: host,
		port: port
	});

	// register API if set
	if ('api' in config) {
		var apiConfig = _.extend({}, defaultOpts.api, config.api);
		var apiDirs = new ApiDirs(apiConfig);
		var baseUrl = apiConfig.baseUrl;

		// register lib plugins
		registerLibPlugins(server, apiDirs.lib);
		// register API endpoints
		registerApiEndpoints(server, apiDirs.routes, baseUrl);
	}

	// register client if set
	if ('client' in config) {
		var clientConfig = _.extend({}, defaultOpts.client, config.client);

		// register client routes
		server.register(
			{
				register: require('./client'),
				options: clientConfig
			},
			function (e) {
				if (e) {
					console.log('client', e);
				}
			});
	}

	// start the server
	server.start(function (e) {

		if (e) {
			throw e;
		}

		console.log('Server running at:', server.info.uri);
	});
}


/**
 *	Helper functions
 */

// Constructor function for API Directory path information
function ApiDirs(obj) {
	this.rootDir = 'rootDir' in obj ? obj.rootDir : '';
	this.routesDir = 'routesDir' in obj ? obj.routesDir : 'api';
	this.libDir = 'libDir' in obj ? obj.libDir : 'lib';
	this.configDir = 'configDir' in obj ? obj.configDir : 'config';

	// accessor methods
	Object.defineProperty(this, 'root', {
		get: function() {
			var root = this.rootDir;
			if (root.slice(-1) !== '/') {
				root += '/';
			}
			return root;
		}
	});
	Object.defineProperty(this, 'routes', {
		get: function() {
			return this.root + this.routesDir;
		}
	});
	Object.defineProperty(this, 'lib', {
		get: function() {
			return this.root + this.libDir;
		}
	});
	Object.defineProperty(this, 'config', {
		get: function() {
			return this.root + this.configDir;
		}
	});
}


// function to register all API files in given rootDir
// endpoints will be namespaced under given rootUrlPath
function registerApiEndpoints(server, rootDir, rootUrlPath) {
	var API_DIR = rootDir;
	var API_URL_PATH = rootUrlPath;

	// guarantee trailing slash in API_DIR
	if (rootDir.slice(-1) !== '/') {
		API_DIR = rootDir + '/';
	}

	// guarantee leading slash in API_URL_PATH
	if (rootUrlPath.slice(0) !== '/') {
		API_URL_PATH = '/' + rootUrlPath;
	}

	var apis = fs.readdirSync(API_DIR), api;
	for (var i = 0; i < apis.length; i++) {
		api = API_DIR + apis[i];
		// register all *.js files in API_DIR
		if (api.match(/.*\.js$/)) {
			api = path.resolve(api); // turn into absolute path
			server.register(
				{
					register: require(api)
				},
				{
					routes: {
						prefix: API_URL_PATH
					}
				},
				onRegisterApiError);
		}
	}
}
function onRegisterApiError(e) {
	if (e) {
		throw e;
	}
}

// function to register all lib files
function registerLibPlugins(server, rootDir) {
	var LIB_DIR = rootDir;

	// guarantee trailing slash in LIB_DIR
	if (rootDir.slice(-1) !== '/') {
		LIB_DIR = rootDir + '/';
	}

	var plugins = fs.readdirSync(LIB_DIR), plugin;
	for (var i = 0; i < plugins.length; i++) {
		plugin = LIB_DIR + plugins[i];
		// register all *.js files in LIB_DIR
		if (plugin.match(/.*\.js$/)) {
			plugin = path.resolve(plugin); // turn into absolute path
			server.register(
				{
					register: require(plugin)
				},
				onRegisterPluginError);
		}
	}
}
function onRegisterPluginError(e) {
	if (e) {
		throw e;
	}
}
