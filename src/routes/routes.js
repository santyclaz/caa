(function() {

	var module = angular.module('caa.routes', [
		'ui.router'
	]);

	module.config([
		'$stateProvider',
		function routes($stateProvider) {

			$stateProvider.state('story', {
				url: '/story',
				templateUrl: 'views/story/story.html',
				controller: 'story',
			});

			$stateProvider.state('rsvp', {
				url: '/rsvp',
				templateUrl: 'views/rsvp/rsvp.html',
				controller: 'rsvp',
			});
		}
	]);


})();