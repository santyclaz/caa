(function() {

	var module = angular.module('caa', [
		// routes
		'caa.routes',
		// app
		'caa.views.navbar',
		'caa.views.rsvp',
		'caa.views.story',
		'caa.views.wedding',
		// common
		'caa.common.directives.address',
		// lib
		'ui.router',
		'ui.bootstrap',
		'tdn.scale-to-fit',
	]);

	// config
	module.config([
		'$urlRouterProvider', '$locationProvider', // angular services
		function($urlRouterProvider, $locationProvider) {
			// Default route
			$urlRouterProvider.otherwise('/story');

			// Setting html5Mode
			// NOTE: <base href="..." /> tag needed to simplify things with relative urls
			$locationProvider.html5Mode(true);
		}
	]);

	// run
	module.run([
		'$rootScope', // angular services
		'$state', // lib services
		function ($rootScope, $state) {

			// throw exception in $stateChangeError
			$rootScope.$on('$stateChangeError',
				function(e, toState, toParams, fromState, fromParams, error) {
					throw error;
				});
		}
	]);

})();