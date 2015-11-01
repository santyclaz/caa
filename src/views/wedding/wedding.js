(function() {

	var module = angular.module('caa.views.wedding', [
	]);

	module.controller('wedding', WeddingController);

	WeddingController.$inject = [
		'$scope',
	];
	function WeddingController($scope) {

		$scope.locations = [
			{
				name: 'Honda-ya',
				img: 'assets/imgs/story/el-farallon.jpg',
				website: 'www.google.com',
				address: {
					address1: '1234 blah',
					address2: '',
					city: 'Tustin',
					state: 'CA',
					country: 'USA'
				}
			}
		];
	}

})();