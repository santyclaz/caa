/**
 *	Includes
 */

var rp = require('request-promise');


/**
 *	Instagram
 */


register.attributes = {
	name: 'rsvp',
	dependencies: 'Response'
};

function register(server, options, next) {

	server.route({
		method: 'POST',
		path: '/rsvp',
		handler: function (request, reply) {
			var config = server.config['google-form']();
			var q = request.parma;
			var payload = request.payload;
			transformFormParams(payload); // transform before turning into googleFormObj

			var formUrl = config.formUrl;
			var googleFormObj = toGoogleFormKeys(payload, config.formKeyMappings);

			var options = {
				method: 'POST',
				uri: formUrl,
				form: googleFormObj,
			};

			// Send off request to Instagram API
			rp(options).then(
				function (responseBody) {
					var endpointResponse = request.success(googleFormObj);
					reply(endpointResponse);
				},
				function (error) {
					var endpointResponse = request.error(googleFormObj);
					reply(endpointResponse);
				});

		}
	});

	next();
}

exports.register = register;


/**
 *	Helper methods
 */

function toGoogleFormKeys(params, googleFormKeyMap) {
	var result = {};

	var keys = Object.keys(params), gkey;
	keys.forEach(function(key, i) {
		gkey = key in googleFormKeyMap ? googleFormKeyMap[key] : null;
		if (gkey) {
			result[gkey] = params[key];
		}
	});

	return result;
}

// this effects the original object
function transformFormParams(params) {
	if ('guests' in params) {
		var guests = params.guests, guestKey;
		guests.forEach(function(guest, i) {
			guestKey = 'guest' + (i + 1);
			params[guestKey] = guest.name;
		});
		delete params.guests;
	}
}
