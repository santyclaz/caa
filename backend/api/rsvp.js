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
			var config = server.config.instagram();
			var q = request.parma;
			var payload = request.payload;
			transformFormParams(payload);
			var googleFormObj = toGoogleFormKeys(payload);

			var options = {
				method: 'POST',
				uri: 'https://docs.google.com/forms/d/10KRGpXZ6p-VBgojWCUfsmL3OngYRkIIGGxtqWO1oqnQ/formResponse',
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

function toGoogleFormKeys(params) {
	var result = {};

	var keys = Object.keys(params), gkey;
	keys.forEach(function(key, i) {
		gkey = mapToGoogleFormKey(key);
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

function mapToGoogleFormKey(key) {
	var gkey = null;
	var map = {
		'name': 'entry.1821408553',
		'attending': 'entry.1305943091',
		'inviteCount': 'entry.1987180806',
		'guest1': 'entry.1977986019',
		'guest2': 'entry.711950605',
		'guest3': 'entry.1393261919',
		'guest4': 'entry.288200054',
		'action': 'entry.2031775266',
		'song': 'entry.1586272080',
		'comments': 'entry.1400487606',
	};
	if (key in map) {
		gkey = map[key];
	}
	return gkey;
}

