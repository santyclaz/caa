(function() {

	var module = angular.module('caa', [
		// app
		'caa.views.rsvp',
		'caa.routes',
		// lib
		'ui.router',
		'ui.bootstrap',
	]);

	module.config([
		'$urlRouterProvider', '$locationProvider',
		function($urlRouterProvider, $locationProvider) {
			// Default route
			$urlRouterProvider.otherwise('/');

			// Setting html5Mode
			// NOTE: <base href="..." /> tag needed to simplify things with relative urls
			$locationProvider.html5Mode(true);
		}
	]);

})();