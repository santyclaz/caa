(function() {

	var module = angular.module('caa.views.rsvp', [
	]);

	module.controller('rsvp', RsvpController);

	RsvpController.$inject = [
		'$scope',
	];
	function RsvpController($scope) {

		var form = {
			name: {
				value: null,
			},
			attending: {
				value: null,
				options: [
					'certainly',
					'sadly not',
				],
				isTrue: function() {
					var attending = form.attending.value === 'certainly';
					return attending;
				},
			},
			inviteCount: {
				value: null,
				selected: null,
				options: [
					{
						value: 1,
						label: 'my awesome self',
					},
					{
						value: 2,
						label: '1 additional guest',
					},
					{
						value: 3,
						label: '2 additional guests',
					},
					{
						value: 4,
						label: '3 additional guests',
					},
				],
				select: function(option) {
					form.inviteCount.selected = option;
					form.inviteCount.value = option.value;

					var guestCount = form.inviteCount.value - 1;
					var currGuests = form.guests.value;
					var newGuests = [], guest;
					for (var i = 0; i < guestCount; i++) {
						if (i in currGuests) {
							guest = currGuests[i];
						}
						else {
							guest = {name: ''};
						}
						newGuests.push(guest);
					}
					form.guests.value = newGuests;
				},
			},
			guests: {
				value: [],
			},
			action: {
				value: null,
			},
			song: {
				value: null,
			},
			comments: {
				value: null,
			},
		};

		$scope.form = form;


	}

})();