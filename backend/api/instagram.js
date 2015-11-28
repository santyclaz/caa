/**
 *	Instagram
 */

register.attributes = {
	name: 'instagram',
	dependencies: 'Response'
};

function register(server, options, next) {

	server.route({
		method: 'GET',
		path: '/instagram',
		handler: function (request, reply) {
			var payload = "instagram!";

			var response = request.success(payload);
			reply(response);
		}
	});

	next();
}

exports.register = register;