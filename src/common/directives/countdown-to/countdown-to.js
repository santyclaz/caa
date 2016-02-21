/**
 * CountdownTo
 */

(function() {
'use strict';

var module = angular.module('caa.common.directives.countdown-to', []);


module.directive('countdownTo', function() {
	var templateUrl = 'common/directives/countdown-to/countdown-to.html';

	return {
		restrict: 'EA',
		scope: {
			countdownTo: '=countdownTo',
			format: '=format',
		},
		templateUrl: templateUrl,
		controller: CountdownToCtrl,
	};
});


var defaultFormats = {
	years: function(years, timeLeftObj) {
		var result = '';
		if (typeof years === 'number' && years !== 0) {
			result = years + ' years';
		}
		return result;
	},
	months: function(months, timeLeftObj) {
		var result = '';
		if (typeof months === 'number' && months !== 0) {
			result = months + ' months';
		}
		return result;
	},
	days: function(days, timeLeftObj) {
		var result = '';
		if (typeof days === 'number' && days !== 0) {
			result = days + ' days';
		}
		return result;
	},
	hours: function(hours, timeLeftObj) {
		var result = '';
		if (typeof hours === 'number') {
			result = hours + ' hours';
		}
		return result;
	},
	minutes: function(minutes, timeLeftObj) {
		var result = '';
		if (typeof minutes === 'number') {
			result = minutes + ' minutes';
		}
		return result;
	},
	seconds: function(seconds, timeLeftObj) {
		var result = '';
		if (typeof seconds === 'number') {
			result = seconds + ' seconds';
		}
		return result;
	},
};


CountdownToCtrl.$inject = ['$scope', '$element', '$attrs', '$transclude', '$interval'];
function CountdownToCtrl($scope, $element, $attrs, $transclude, $interval) {

	/**
	 * init
	 */

	$element.addClass('countdown-to');

	$scope.toDate = null;
	$scope.timeLeft = {};
	$scope.formatFns = defaultFormats;

	$scope.$watch('countdownTo', onToDateChange);
	$scope.$watch('format', onFormatChange);


	$interval(function() {
		var toDate = $scope.toDate;
		$scope.timeLeft = calculateTimeLeft(toDate);
	}, 1000);

	/**
	 * methods
	 */

	$scope.getTimeLeftStr = getTimeLeftStr;


	/**
	 * method definitions
	 */

	function getTimeLeftStr(unit) {
		var result = '';
		if (unit in $scope.formatFns) {
			var timeLeft = $scope.timeLeft;
			var formatFn = $scope.formatFns[unit];
			var unitLeft = timeLeft[unit];
			result = formatFn(unitLeft, timeLeft);
		}
		return result;
	}

	function calculateTimeLeft(toDate) {
		var now = new Date();
		var diff = Math.floor((toDate.getTime() - now.getTime()) / 1000);
		var past = diff < 0;

		var t = Math.abs(diff);
		var days = Math.floor(t / 86400);
		t -= days * 86400;
		var hours = Math.floor(t / 3600) % 24;
		t -= hours * 3600;
		var minutes = Math.floor(t / 60) % 60;
		t -= minutes * 60;
		var seconds = t % 60;

		var timeLeftObj = {
			days: days,
			hours: hours,
			minutes: minutes,
			seconds: seconds,
		};

		if (past) {
			Object.keys(timeLeftObj).forEach(function(key) {
				timeLeftObj[key] = 0 - timeLeftObj[key];
			});
		}

		return timeLeftObj;
	}

	function onToDateChange(newVal) {
		var toDate = null;

		if (typeof newVal === 'string') {
			toDate = new Date(newVal);
		}
		else if (newVal instanceof Date) {
			toDate = newVal;
		}
		else {
			toDate = new Date();
		}

		$scope.toDate = toDate;
	}

	function onFormatChange(newVal) {
		$scope.formatFns = defaultFormats;
	}
}

})();
