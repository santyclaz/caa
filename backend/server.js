var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var Hapi = require('hapi');
var jsonfile = require('jsonfile');


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

		// pull in configs
		registerConfigs(server, apiDirs.config);
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

	var apis = fs.readdirSync(API_DIR);
	apis.forEach(
		function register(api) {
			var apiPath = API_DIR + api;
			// register all *.js files in API_DIR
			if (apiPath.match(/.*\.js$/)) {
				apiPath = path.resolve(apiPath); // turn into absolute path
				server.register(
					{
						register: require(apiPath)
					},
					{
						routes: {
							prefix: API_URL_PATH
						}
					},
					onRegisterApiError);
			}
		});
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

	var plugins = fs.readdirSync(LIB_DIR);
	plugins.forEach(
		function register(plugin) {
			var pluginPath = LIB_DIR + plugin;
			// register all *.js files in LIB_DIR
			if (pluginPath.match(/.*\.js$/)) {
				pluginPath = path.resolve(pluginPath); // turn into absolute path
				server.register(
					{
						register: require(pluginPath)
					},
					onRegisterPluginError);
			}
		});
}
function onRegisterPluginError(e) {
	if (e) {
		throw e;
	}
}

// registers config accessor functions to server.config
function registerConfigs(server, rootDir) {
	var CONFIG_DIR = rootDir;

	// guarantee trailing slash in CONFIG_DIR
	if (rootDir.slice(-1) !== '/') {
		CONFIG_DIR = rootDir + '/';
	}

	var configs = fs.readdirSync(CONFIG_DIR);
	var configsMap = {};

	configs.forEach(
		function register(config) {
			var configPath = CONFIG_DIR + config, filename;
			// register all *.json files in CONFIG_DIR
			if (configPath.match(/.*\.json$/)) {
				configPath = path.resolve(configPath); // turn into absolute path
				filename = path.basename(configPath, '.json');

				// register config accessor function
				configsMap[filename] = function getConfig() {
					var configObj = jsonfile.readFileSync(configPath);
					return configObj;
				};

			}
		});

	server.decorate('server', 'config', configsMap);
}
function onRegisterConfigsError(e) {
	if (e) {
		throw e;
	}
}
