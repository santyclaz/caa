(function() {

	var module = angular.module('caa.routes', [
		'ui.router'
	]);

	module.config([
		'$stateProvider',
		function routes($stateProvider) {

			// Root state
			$stateProvider.state('rsvp', {
				url: '/',
				templateUrl: 'views/rsvp/rsvp.html',
				controller: 'rsvp'
			});
		}
	]);


})();