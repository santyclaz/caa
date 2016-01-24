/**
 *	Includes
 */

var rp = require('request-promise');


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
			var config = server.config.instagram();
			var q = request.query;

			var apiUrl = config.apiUrl + '/tags/thunderlene/media/recent';
			var url = apiUrl;

			// Handle query params to pass along to instagram
			var query = {};
			query.access_token = config.accessKey;
			query.count = 'count' in q ? q.count : 12;
			if ('minId' in q) {
				query.max_tag_id = q.minId;
			}

			url = addQueryParams(url, query);

			// Handle filtering of results
			var filterFns = [];
			// users expedcted to be csv string of username of user ids
			// will only return media from given users
			if ('users' in q) {
				var users = q.users.trim().split(',');
				if (users.length > 0) {
					filterFns.push(function filterForUsers(media) {
						var user = media.user;
						return users.indexOf(user.username) > -1 || users.indexOf(user.id) > -1;
					});
				}
			}

			// Send off request to Instagram API
			rp(url).then(
				function (responseBody) {
					var response = JSON.parse(responseBody);

					var medias = [];
					var meta = {};

					// populate medias
					response.data.forEach(function(mediaData) {
							var media = new Media();
							media.populate(mediaData);

							// run through any filter rules
							var keep = filterFns.every(function(fn) {
								return fn(media);
							});

							if (keep) {
								medias.push(media);
							}
						});

					// populate pagination
					var pagination = new Pagination();
					pagination.populate(response.pagination);

					// set meta values
					meta.pagination = pagination;
					meta.url = url;

					// send instagram API data back
					var endpointResponse = request.success(medias, meta);
					reply(endpointResponse);
				},
				function (error) {
					var endpointResponse = request.error(error);

					// attempt to parse
					try {
						var responseBody = error.response.body;
						var response = JSON.parse(responseBody);
						endpointResponse.error(response);
						console.log(url);
					}
					catch (e) {
						endpointResponse.error(error);
						endpointResponse.error(e);
						console.log(url);
					}

					// send instagram API data back
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

function addQueryParams(string, paramsObj) {
	var result = string;

	var queryParams = [];
	Object.keys(paramsObj).forEach(function (key) {
			var param = key + '=' + paramsObj[key];
			queryParams.push(param);
		});
	if (queryParams.length > 0) {
		result += '?' + queryParams.join('&');
	}

	return result;
}


/**
 *	Constructors
 */

function Media() {
	this.type = null;
	this.images = {};
	this.caption = {};
	this.user = {};
}

// populate instance given Instagram media data
Media.prototype.populate = function populate(instagramMedia) {
	var data = typeof instagramMedia === 'object' ? instagramMedia : {};
	var imgs = data.images;

	this.type = 'type' in data ? data.type : null;
	this.setThumbnail(imgs.low_resolution);
	this.setStandard(imgs.standard_resolution);
	this.setUser(data.user);
	this.setCaptionText(data.caption.text);
};

Media.prototype.setThumbnail = function setThumbnail(obj) {
	this.images.thumbnail = obj ? obj : null;
};
Media.prototype.setStandard = function setStandard(obj) {
	this.images.standard = obj ? obj : null;
};
Media.prototype.setUser = function setUser(obj) {
	this.user = obj;
};
Media.prototype.setCaptionText = function setCaptionText(text) {
	this.caption.text = text;
};


function Pagination() {
	this.min = null; // id of first entity on next page
}

Pagination.prototype.populate = function populate(instagramPagination) {
	this.minId = 'next_max_tag_id' in instagramPagination ? instagramPagination.next_max_tag_id : null;
};
