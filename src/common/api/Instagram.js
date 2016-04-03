(function() {

	var module = angular.module('caa.common.api.Instagram', [
	]);


	/**
	 *	API Instagram
	 */

	module.factory('api.Instagram', definition);

	definition.$inject = [
		'$http',
		'services.URL',
	];
	function definition($http, URL) {

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
			url = URL.addQueryParams(url, queryParams);

			return $http.get(url);
		}


		return API;
	}

})();