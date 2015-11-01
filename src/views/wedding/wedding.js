(function() {

	var module = angular.module('caa.views.wedding', [
	]);

	module.controller('wedding', WeddingController);

	WeddingController.$inject = [
		'$scope',
	];
	function WeddingController($scope) {

		$scope.categories = {
			venue: {
				name: 'Ceremony & Reception',
				img: 'assets/imgs/wedding/venue.jpg',
				places: [
					{
						name: 'Gerry Ranch',
						address: {
							address1: '9015 Rosita Rd.',
							address2: '',
							city: 'Camarillo',
							state: 'CA',
							postalCode: '93012',
							mapLink: 'www.google.com/maps/place/Gerry+Ranch/@34.2421004,-118.9479015,17z/data=!3m1!4b1!4m2!3m1!1s0x80e8314949bb9183:0xd6cb1cd1d06ec367'
						},
					}
				]
			},
			schedule: {
				name: 'Event Schedule',
				img: 'assets/imgs/wedding/schedule.jpg',
			},
			attire: {
				name: 'Attire',
				img: 'assets/imgs/wedding/attire.jpg',
			},
			hotels: {
				name: 'Hotel Accommodations',
				img: 'assets/imgs/wedding/hotels.jpg',
				places: [
					{
						name: 'Sheraton Inn',
						address: {
							address1: '1234 blah',
							address2: '',
							city: 'Tustin',
							state: 'CA',
							country: 'USA'
						},
						phone: '(555) 555-5555',
						description: 'Japanese deliciousness',
					},
					{
						name: 'Embassy Suites',
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
				]
			},
		};

	}

})();