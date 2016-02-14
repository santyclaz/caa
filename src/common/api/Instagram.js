(function() {

	var module = angular.module('caa.common.api.Instagram', [
	]);


	/**
	 *	Directive
	 */

	module.factory('api.Instagram', definition);

	definition.$inject = [
		'$http'
	];
	function definition($http) {

		/**
		 *	API
		 */

		var API = {
			get: get
		};


		/**
		 *	Method definitions
		 */

		function get(params) {
			var url = 'api/instagram';
			var queryParams = angular.extend({}, params);
			url = addQueryParams(url, queryParams);

			return $http.get(url);
		}


		/**
		 *	Helper methods
		 */

		function addQueryParams(string, paramsObj) {
			var result = string;

			var queryParams = [], queryStr;
			Object.keys(paramsObj).forEach(function (key) {
					var param = key + '=' + paramsObj[key];
					queryParams.push(param);
				});

			if (queryParams.length > 0) {
				queryStr = queryParams.join('&');

				var qIndex = string.indexOf('?');

				// if string contains ?
				if (qIndex > -1) {
					// if ? isn't at very end of string
					if (qIndex !== string.length - 1) {
						result += '&';
					}
					result += queryStr;
				}
				// if string doesn't have ?
				else {
					result += '?' + queryStr;
				}
			}

			return result;
		}


		return API;
	}

})();