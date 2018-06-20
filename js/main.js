let restaurants, neighborhoods, cuisines;
var newMap;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
	initMap();
	fetchNeighborhoods();
	fetchCuisines();
	registerServiceWorker();
});

initMap = () => {
	self.newMap = L.map('map', {
		center: [40.722216, -73.987501],
		zoom: 12,
		scrollWheelZoom: false
	});
	L.tileLayer(
		'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}',
		{
			mapboxToken:
				'pk.eyJ1IjoiamRyZWNoc2xlciIsImEiOiJjamluYnV4eHowMjk0M3FtcmdzbGozc3ZqIn0.FvnlLMeArd9qAUIcZ6e-NA',
			maxZoom: 18,
			attribution:
				'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
				'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			id: 'mapbox.streets'
		}
	).addTo(newMap);

	updateRestaurants();
};

registerServiceWorker = () => {
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', async () => {
			try {
				const reg = await navigator.serviceWorker.register('sw.js');
				console.log('Registration successful. Scope is ' + reg.scope);
			} catch (error) {
				console.log('Registration failed.', error);
			}
		});
	}
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = async () => {
	try {
		const neighborhoods = await DBHelper.fetchNeighborhoods();
		self.neighborhoods = neighborhoods;
		fillNeighborhoodsHTML();
	} catch (error) {
		console.error(error);
	}
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
	const select = document.getElementById('neighborhoods-select');
	neighborhoods.forEach(neighborhood => {
		const option = document.createElement('option');
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		select.appendChild(option);
	});
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = async () => {
	try {
		const cuisines = await DBHelper.fetchCuisines();
		self.cuisines = cuisines;
		fillCuisinesHTML();
	} catch (error) {
		console.error(error);
	}
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
	const select = document.getElementById('cuisines-select');

	cuisines.forEach(cuisine => {
		const option = document.createElement('option');
		option.innerHTML = cuisine;
		option.value = cuisine;
		select.appendChild(option);
	});
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = async () => {
	const cSelect = document.getElementById('cuisines-select');
	const nSelect = document.getElementById('neighborhoods-select');

	const cIndex = cSelect.selectedIndex;
	const nIndex = nSelect.selectedIndex;

	const cuisine = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;

	try {
		const restaurantsByCuisineAndNeighborhood = await DBHelper.fetchRestaurantByCuisineAndNeighborhood(
			cuisine,
			neighborhood
		);
		resetRestaurants(restaurantsByCuisineAndNeighborhood);
		fillRestaurantsHTML();
		updateResultsCount();
	} catch (error) {
		console.error(error);
	}
};

/**
 * Update results with aria-live
 */
updateResultsCount = () => {
	const resultsList = document.getElementById('restaurants-list');
	const numResults = resultsList.children.length;
	const spanCountElement = document.getElementsByClassName('results-count')[0];
	if (numResults < 1) {
		spanCountElement.textContent = '(No results found)';
	} else if (numResults === 1) {
		spanCountElement.textContent = '(1 result found)';
	} else {
		spanCountElement.textContent = `(${numResults} results found)`;
	}
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = restaurants => {
	// Remove all restaurants
	self.restaurants = [];
	const ul = document.getElementById('restaurants-list');
	ul.innerHTML = '';

	// Remove all map markers
	if (self.markers) {
		self.markers.forEach(marker => marker.remove());
	}
	self.markers = [];
	self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
	const ul = document.getElementById('restaurants-list');
	restaurants.forEach(restaurant => {
		ul.appendChild(createRestaurantHTML(restaurant));
	});
	addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = restaurant => {
	const li = document.createElement('li');

	const image = document.createElement('img');
	image.className = 'restaurant-img';
	/**@type {string} */
	const imgSrc = DBHelper.imageUrlForRestaurant(restaurant);

	const imgSrc200 = imgSrc.replace('_400', '_200');
	const imgSrc400 = imgSrc;

	image.srcset = `${imgSrc200} 200w, ${imgSrc400} 400w`;
	image.sizes = `(max-width: 350px) 200px, (min-width: 400px) 250px`;
	image.src = imgSrc;
	image.alt = DBHelper.imageAltForRestaurant(restaurant);
	li.appendChild(image);

	const name = document.createElement('h1');
	name.innerHTML = restaurant.name;
	name.tabIndex = '0';
	li.appendChild(name);

	const neighborhood = document.createElement('p');
	neighborhood.innerHTML = restaurant.neighborhood;
	li.appendChild(neighborhood);

	const address = document.createElement('p');
	address.innerHTML = restaurant.address;
	li.appendChild(address);

	const more = document.createElement('a');
	more.innerHTML = 'View Details';
	more.href = DBHelper.urlForRestaurant(restaurant);
	li.appendChild(more);

	return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
	restaurants.forEach(restaurant => {
		// Add marker to the map
		const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
		marker.on('click', onClick);
		function onClick() {
			window.location.href = marker.options.url;
		}
		self.markers.push(marker);
	});
};
