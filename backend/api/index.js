/**
 *	Index
 */

register.attributes = {
	name: 'index',
	dependencies: 'Response'
};

function register(server, options, next) {

	var prefix = server.realm.modifiers.route.prefix;

	server.route({
		method: 'GET',
		path: '/hello',
		handler: function (request, reply) {
			var payload = 'hello world';

			var response = request.success(payload);
			reply(response);
		}
	});

	server.route({
		method: 'GET',
		path: '/',
		handler: function (request, reply) {
			var payload = "I am the API!";

			var response = request.success(payload);
			reply(response);
		}
	});

	server.route({
		method: 'GET',
		path: '/{catchall*}',
		handler: function (request, reply) {
			var relativePath = prefix ? request.path.substring(prefix.length) : request.path;
			var payload = "API endpoint '" + relativePath + "' does not exist";

			var response = request.error(payload);
			reply(response);
		}
	});

	next();
}

exports.register = register;