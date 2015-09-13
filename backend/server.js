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
	apiPath: 'api',
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
	var apiPath = '/' + ('apiPath' in config ? config.apiPath : defaultOpts.apiPath);

	var client = defaultOpts.client;
	if ('client' in config) {
		if (typeof config.client === 'object') {
			client = config.client;
		}
		else {
			client = false;
		}
	}

	// create a server with a host and port
	var server = new Hapi.Server();
	server.connection({
		host: host,
		port: port
	});

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

	// check if client routing enabled
	if (client) {
		var clientPath = 'path' in client ? client.path : defaultOpts.client.path;
		var livereload = 'livereload' in client ? client.livereload : defaultOpts.client.livereload;

		// register client routes
		server.register(
			{
				register: require('./client'),
				options: {
					clientPath: clientPath,
					livereload: livereload
				}
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