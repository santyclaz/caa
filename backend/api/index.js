/**
 *	Index
 */

exports.register = function (server, options, next) {

	var prefix = server.realm.modifiers.route.prefix;

	server.route({
		method: 'GET',
		path: '/hello',
		handler: function (request, reply) {
			var payload = 'hello world';
			reply(payload);
		}
	});

	server.route({
		method: 'GET',
		path: '/',
		handler: function (request, reply) {
			var payload = "I am the API!";
			reply(payload);
		}
	});

	server.route({
		method: 'GET',
		path: '/{catchall*}',
		handler: function (request, reply) {
			var relativePath = prefix ? request.path.substring(prefix.length) : request.path;
			var payload = "API endpoint '" + relativePath + "' does not exist";
			reply(payload);
		}
	});

	next();
};

exports.register.attributes = {
	name: 'index'
};