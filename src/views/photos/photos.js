(function() {

	var module = angular.module('caa.views.photos', [
	]);

	module.controller('photos', PhotosController);

	PhotosController.$inject = [
		'$scope',
		'api.Instagram',
	];
	function PhotosController($scope, ApiInstagram) {

		$scope.photos = [];

		ApiInstagram.get().then(
			function(httpResponse) {
				var response = httpResponse.data;
				var photos = response.data;

				$scope.photos = photos;
			});
	}

})();