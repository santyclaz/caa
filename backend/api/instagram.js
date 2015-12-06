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

			// Handle query params
			var query = {};
			query.access_token = config.accessKey;
			query.count = 'count' in q ? q.count : 12;
			if ('minId' in q) {
				query.max_tag_id = q.minId;
			}

			var queryParams = [];
			Object.keys(query).forEach(function (key) {
					var param = key + '=' + query[key];
					queryParams.push(param);
				});
			if (queryParams.length > 0) {
				url += '?' + queryParams.join('&');
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
							medias.push(media);
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
					var endpointResponse = request.error(response);

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

function mapMedia() {

}


/**
 *	Constructors
 */

function Media() {
	this.type = null;
	this.images = {};
}

// populate instance given Instagram media data
Media.prototype.populate = function populate(instagramMedia) {
	var data = typeof instagramMedia === 'object' ? instagramMedia : {};
	var imgs = data.images;

	this.type = 'type' in data ? data.type : null;
	this.setThumbnail(imgs.low_resolution);
	this.setStandard(imgs.standard_resolution);
};

Media.prototype.setThumbnail = function setThumbnail(obj) {
	this.images.thumbnail = obj ? obj : null;
};
Media.prototype.setStandard = function setStandard(obj) {
	this.images.standard = obj ? obj : null;
};


function Pagination() {
	this.min = null; // id of first entity on next page
}

Pagination.prototype.populate = function populate(instagramPagination) {
	this.minId = 'next_max_tag_id' in instagramPagination ? instagramPagination.next_max_tag_id : null;
};
