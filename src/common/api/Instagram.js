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

		function get() {
			return $http.get('api/instagram');
		}


		return API;
	}

})();