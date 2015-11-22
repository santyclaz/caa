/**
 *	Instagram
 */

exports.register = function (server, options, next) {

	server.route({
		method: 'GET',
		path: '/instagram',
		handler: function (request, reply) {
			var payload = "instagram!";
			reply(payload);
		}
	});

	next();
};

exports.register.attributes = {
	name: 'instagram'
};