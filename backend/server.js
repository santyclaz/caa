var _ = require('lodash');
var Hapi = require('hapi');


/**
 * API
 */

var API = {
	start: start
};

var defaultOpts = {
	host: 'localhost',
	port: 7070,
	api: {
		path: 'api',
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
		var apiPath = '/' + apiConfig.path;

		// register API routes
		server.register(
			{
				register: require('./api')
			},
			{
				routes: {
					prefix: apiPath
				}
			},
			function (err) {
				if (err) {
					console.log('api', err);
				}
			});
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


// Expose API
module.exports = API;