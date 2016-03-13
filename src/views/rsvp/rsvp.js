(function() {

	var module = angular.module('caa.views.rsvp', [
	]);

	module.controller('rsvp', RsvpController);

	RsvpController.$inject = [
		'$scope',
	];
	function RsvpController($scope) {
		$scope.form = {
			attending: {
				value: null,
				options: [
					'certainly',
					'not be',
				]
			},
		};
	}

})();