/**
 * Photo
 */

(function() {
'use strict';

var module = angular.module('caa.common.directives.photo', []);


module.directive('photo', function() {
	var templateUrl = 'common/directives/photo/photo.html';

	return {
		restrict: 'EA',
		scope: {
			ngSrc: '=ngSrc',
			ngClick: '=ngClick',
			overlay: '=overlay',
		},
		templateUrl: templateUrl,
		controller: PhotoController,
	};
});


PhotoController.$inject = ['$scope', '$element', '$attrs', '$transclude'];
function PhotoController($scope, $element, $attrs, $transclude) {
	$element.addClass('photo');

	$attrs.$observe('ngClick', function(val) {
		if (typeof val === 'string') {
			$element.addClass('has-click-action');
		}
	});
}

})();
