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
						},
						mapLink: 'https://www.google.com/maps/place/Gerry+Ranch/@34.2421004,-118.9479015,17z/data=!3m1!4b1!4m2!3m1!1s0x80e8314949bb9183:0xd6cb1cd1d06ec367'
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
						name: 'Hyatt Westlake Plaza',
						address: {
							address1: '8080 S Westlake Blvd.',
							address2: '',
							city: 'Westlake Village',
							state: 'CA',
							postalCode: '91361'
						},
						phone: '(805) 557-1234',
						website: {
							url: 'http://www.hyattwestlake.com',
							label: 'www.hyattwestlake.com'
						},
						// TODO: see if this can be refactored
						reservation: {
							url: 'https://resweb.passkey.com/go/leungho',
							price: '$174',
						}
					},
					{
						name: 'Hampton Inn & Suites',
						address: {
							address1: '30255 Agoura Road',
							address2: '',
							city: 'Agoura Hills',
							state: 'CA',
							postalCode: '91301'
						},
						phone: '(818) 597-0333',
						website: {
							url: 'http://hamptoninn3.hilton.com/en/hotels/california/hampton-inn-and-suites-agoura-hills-AGOCAHX/index.html',
							label: 'hamptoninn3.hilton.com'
						},
						reservation: {
							price: '$136',
							fixedPrice: true
						}
					}
				]
			},
		};

	}

})();