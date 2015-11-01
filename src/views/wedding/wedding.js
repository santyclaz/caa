(function() {

	var module = angular.module('caa.views.wedding', [
	]);

	module.controller('wedding', WeddingController);

	WeddingController.$inject = [
		'$scope',
	];
	function WeddingController($scope) {

		$scope.category = {
			img: 'assets/imgs/story/el-farallon.jpg',
		};

		$scope.places = [
			{
				name: 'Honda-ya',
				website: 'www.google.com',
				address: {
					address1: '1234 blah',
					address2: '',
					city: 'Tustin',
					state: 'CA',
					country: 'USA'
				},
				phone: '(555) 555-5555',
				description: 'Japanese deliciousness',
			}
		];
	}

})();