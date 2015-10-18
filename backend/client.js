// var injectReload = require('gulp-inject-reload');

/**
 * Client routing
 */

var defaultOpts = {
	// path: string, // required, path to client root dir
	index: 'index.html',
	livereload: true,
	spa: true
};

exports.register = function (server, options, next) {

	/**
	 * Process options
	 */

	options = typeof options === 'object' ? options : {};

	if (!('path' in options) || typeof options.path !== 'string') {
		throw new Error('options.path is required');
	}
	if (('index' in options) && typeof options.index !== 'string') {
		throw new Error('options.index currently only supports string');
	}

	var path = options.path;
	var index = 'index' in options ? options.index : defaultOpts.index;
	var spa = 'spa' in options ? options.spa : defaultOpts.spa;


	/**
	 * Serve static files
	 */

	server.register(require('inert'), function (err) {

		if (err) {
			throw err;
		}

		// UI routes
		server.route({
			method: 'GET',
			path: '/{param*}',
			handler: {
				directory: {
					path: path,
					listing: false,
					index: index
				}
			}
		});

		// For SPA, serve index file if request doesn't resolve to file
		if (spa) {
			// http://stackoverflow.com/a/29310691
			server.ext('onPreResponse', onPreResponse);
		}

		next();
	});


	/**
	 * Methods
	 */

	function onPreResponse(request, reply) {
		var response = request.response;

		// On error
		if (response.isBoom) {
			var statusCode = response.output.statusCode;

			if (statusCode === 404) {
				return reply.file(path + '/' + index);
			}
		}

		// TODO: inject livereload js

		return reply.continue();
	}

};

exports.register.attributes = {
	name: 'client'
};