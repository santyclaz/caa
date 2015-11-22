var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var Hapi = require('hapi');


/**
 * API
 */

module.exports = API = {
	start: start
};

var defaultOpts = {
	host: 'localhost',
	port: 7070,
	api: {
		path: 'api',
		urlPath: 'api'
	},
	client: {
		path: 'src',
		livereload: true
	}
};


/**
 * Methods
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
		registerApiEndpoints(server, apiConfig.path, apiConfig.urlPath);
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
			function (err) {
				if (err) {
					console.log('client', err);
				}
			});
	}

	// start the server
	server.start(function () {
		 console.log('Server running at:', server.info.uri);
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
		console.log('onRegisterApiError', e);
	}
}