(function() {

	var module = angular.module('caa.common.services.URL', [
	]);


	/**
	 *	URL
	 */

	module.factory('services.URL', definition);

	definition.$inject = [
	];
	function definition() {

		/**
		 *	API
		 */

		var API = {
			addQueryParams: addQueryParams,
			toQueryString: toQueryString,
		};


		/**
		 *	Method definitions
		 */

		function addQueryParams(string, paramsObj) {
			var result = string;

			var queryStr = toQueryString(paramsObj);

			if (queryStr !== '') {
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

		function toQueryString(paramsObj) {
			var queryStr = '';
			var params = Object.keys(paramsObj);
			var paramCount = params.length;

			params.forEach(function (key, index) {
					var param = key + '=' + paramsObj[key];
					queryStr += param;
					if (paramCount > 1 && index < paramCount - 1) {
						queryStr += '&';
					}
				});

			return queryStr;
		}


		return API;
	}

})();