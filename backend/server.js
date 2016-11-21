var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var Hapi = require('hapi');
var jsonfile = require('jsonfile');
var Promise = require('bluebird');
var reload = require('require-reload')(require);


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
 * Constructor definition
 */

function Server() {
	this.config = {};

	// internal attributes
	this.server = null;
	this.startedPromise = null;
	this.stoppedPromise = null;
	this.restartPromise = null;
	this.internalState = Server.State.STOPPED;
}


/**
 * Static variables & functions
 */

// Status is derived from interal attributes
Server.Status = {
	STARTING: 'STARTING',
	STARTED: 'STARTED',
	STOPPING: 'STOPPING',
	STOPPED: 'STOPPED',
	RESTARTING: 'RESTARTING',
};

// State is are atomic values that are not derived
Server.State = {
	STARTING: 'STARTING',
	STARTED: 'STARTED',
	STOPPING: 'STOPPING',
	STOPPED: 'STOPPED',
};

Server.getInvalidStatusErrorMessage = function(status) {
	switch (status) {
		case Server.Status.STARTING:
			return 'Server is in the middle of starting up';
		case Server.Status.STARTED:
			return 'Server is already started';
		case Server.Status.STOPPING:
			return 'Server is in the middle of stopping';
		case Server.Status.STOPPED:
			return 'Server is already stopped';
		case Server.Status.RESTARTING:
			return 'Server is in the middle of restarting';
		default:
			return 'Server is in unknown status "' + status + '"';
	}
};


/**
 * Instance methods
 */

Server.prototype.getStatus = function() {
	if (this.restartPromise !== null) {
		return Server.Status.RESTARTING;
	}
	switch (this.internalState) {
		case Server.State.STARTING:
			return Server.Status.STARTING;
		case Server.State.STARTED:
			return Server.Status.STARTED;
		case Server.State.STOPPING:
			return Server.Status.STOPPING;
		case Server.State.STOPPED:
			return Server.Status.STOPPED;
	}
};

Server.prototype.start = function(config) {
	// Doing this check here since there shouldn't be state cleanup in this scenario
	if (this.getStatus() !== Server.Status.STOPPED) {
		var msg = Server.getInvalidStatusErrorMessage(this.getStatus());
		throw new Error(msg);
	}

	return this.__start(config);
};
// start with auto-cleanup on error
Server.prototype.__start = function(config) {
	try {
		return this.__startRaw(config);
	}
	catch(e) {
		// do state cleanup on unexpected failure
		this.reset();
		throw e;
	}
};
// start without auto-cleanup on error
Server.prototype.__startRaw = function(config) {
	var self = this;
	self.internalState = Server.State.STARTING;

	// process options
	// if new set of configs provided, override current
	if (config) {
		self.config = _.extend({}, config);
	}
	// TODO: clean this up, perhaps with extend or destructuring
	var host = 'host' in self.config ? self.config.host : defaultOpts.host;
	var port = 'port' in self.config ? self.config.port : defaultOpts.port;

	// validation
	if (typeof port !== 'number') {
		throw Error('Invalid port "' + port + '"');
	}

	// create a server with a host and port
	self.server = new Hapi.Server();
	self.server.connection({
		host: host,
		port: port
	});

	// register API if set
	if ('api' in self.config) {
		var apiConfig = _.extend({}, defaultOpts.api, self.config.api);
		var apiDirs = new ApiDirs(apiConfig);
		var baseUrl = apiConfig.baseUrl;

		// pull in configs
		registerConfigs(self.server, apiDirs.config);
		// register lib plugins
		registerLibPlugins(self.server, apiDirs.lib);
		// register API endpoints
		registerApiEndpoints(self.server, apiDirs.routes, baseUrl);
	}

	// register client if set
	if ('client' in self.config) {
		var clientConfig = _.extend({}, defaultOpts.client, self.config.client);

		// register client routes
		self.server.register(
			{
				register: reload('./client'),
				options: clientConfig
			},
			function (e) {
				if (e) {
					console.log('client', e);
				}
			});
	}

	// start the server
	var startServer = Promise.promisify(self.server.start, {context: self.server});
	self.startedPromise = startServer()
		.then(function() {
			// console.log('Server started -', server.info.uri);
			self.internalState = Server.State.STARTED;
			return self.server;
		});

	return self.startedPromise;
};

Server.prototype.stop = function() {
	// Doing this check here since there shouldn't be state cleanup in this scenario
	if (this.getStatus() !== Server.Status.STARTED) {
		var msg = Server.getInvalidStatusErrorMessage(this.getStatus());
		throw new Error(msg);
	}

	return this.__stop();
};
// stop with auto-cleanup on error
Server.prototype.__stop = function() {
	try {
		return this.__stopRaw();
	}
	catch(e) {
		// do state cleanup on unexpected failure
		this.internalState = Server.Status.STARTED;
		throw e;
	}
};
// stop without auto-cleanup on error
Server.prototype.__stopRaw = function() {
	var self = this;
	self.internalState = Server.State.STOPPING;

	var stopArgsArray = Array.prototype.slice.call(arguments, 0);
	var stopServer = Promise.promisify(self.server.stop, {context: self.server});
	self.stoppedPromise = stopServer.apply(self.server, stopArgsArray)
		.then(function() {
			// console.log('Server stopped -', server.info.uri);
			var originalServer = self.server;
			self.reset();
			return originalServer;
		});

	return self.stoppedPromise;
};

Server.prototype.restart = function(config) {
	var self = this;

	if (self.getStatus() === Server.Status.RESTARTING) {
		var msg = Server.getInvalidStatusErrorMessage(this.getStatus());
		throw new Error(msg);
	}

	// if new set of configs provided, override current
	if (config) {
		self.config = _.extend({}, config);
	}

	var stoppedPromise;
	if (self.getStatus() === Server.Status.STARTING) {
		stoppedPromise = self.startedPromise.then(function() {
			self.__stop();
		});
	}
	else if (self.getStatus() === Server.Status.STARTED) {
		stoppedPromise = self.__stop();
	}
	else if (self.getStatus() === Server.Status.STOPPING) {
		stoppedPromise = self.stoppedPromise;
	}
	else if (self.getStatus() === Server.Status.STOPPED) {
		stoppedPromise = Promise.resolve(null);
	}

	self.restartPromise = stoppedPromise
		.then(function() {
			return self.__start();
		})
		.finally(function() {
			self.restartPromise = null;
		});

	return self.restartPromise;
};

// reset internal state
Server.prototype.reset = function() {
	this.server = null;
	this.startedPromise = null;
	this.stoppedPromise = null;
	this.internalState = Server.State.STOPPED;
};


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
						register: reload(apiPath)
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
						register: reload(pluginPath)
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


/**
 * Exports
 */

module.exports = new Server();

