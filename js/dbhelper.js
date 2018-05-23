/**
 * Common database helper functions.
 */
class DBHelper {

	/**
	 * Database URL.
	 * Change this to restaurants.json file location on your server.
	 */
	static get DATABASE_URL() {
		const port = 8080 // Change this to your server port
		// return `http://localhost:${port}/data/restaurants.json`;
		return 'data/restaurants.json';
	}

	/**
	 * Fetch all restaurants.
	 */
	static async fetchRestaurants() {
		try {
			const response = await fetch(DBHelper.DATABASE_URL)
			if (response.status === 200) {
				const data = await response.json()
				return data.restaurants
			}
		} catch (error) {
			return error
		}
	}

	/**
	 * Fetch a restaurant by its ID.
	 */
	static async fetchRestaurantById(id, callback) {
		try {
			const restaurants = await DBHelper.fetchRestaurants()
			const restaurant = restaurants.find(r => r.id == id);
			if (restaurant) { // Got the restaurant
				return restaurant
			} else { // Restaurant does not exist in the database
				return 'Restaurant does not exist'
			}
		} catch (error) {
			console.log(error)
			throw error
		}

	}

	/**
	 * Fetch restaurants by a cuisine type with proper error handling.
	 */
	static async fetchRestaurantByCuisine(cuisine, callback) {
		try {
			const restaurants = await DBHelper.fetchRestaurants()
			// Filter restaurants to have only given cuisine type
			return restaurants.filter(r => r.cuisine_type == cuisine);
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Fetch restaurants by a neighborhood with proper error handling.
	 */
	static async fetchRestaurantByNeighborhood(neighborhood, callback) {
		try {
			const restaurants = await DBHelper.fetchRestaurants()
			// Filter restaurants to have only given neighborhood
			return restaurants.filter(r => r.neighborhood == neighborhood);
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
	 */
	static async fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
		try {
			const restaurants = await DBHelper.fetchRestaurants()
			let results = restaurants
			if (cuisine != 'all') { // filter by cuisine
				results = results.filter(r => r.cuisine_type == cuisine);
			}
			if (neighborhood != 'all') { // filter by neighborhood
				results = results.filter(r => r.neighborhood == neighborhood);
			}
			return results
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Fetch all neighborhoods with proper error handling.
	 */
	static async fetchNeighborhoods() {
		try {
			const restaurants = await DBHelper.fetchRestaurants()
			// Get all neighborhoods from all restaurants
			const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
			// Remove duplicates from neighborhoods
			const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
			return uniqueNeighborhoods;
		} catch (error) {
			return error;
		}


	}

	/**
	 * Fetch all cuisines with proper error handling.
	 */
	static async fetchCuisines() {
		try {
			// Fetch all restaurants
			const restaurants = await DBHelper.fetchRestaurants()
			// Get all cuisines from all restaurants
			const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
			// Remove duplicates from cuisines
			const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
			return uniqueCuisines

		} catch (error) {
			return error
		}

	}

	/**
	 * Restaurant page URL.
	 */
	static urlForRestaurant(restaurant) {
		return (`./restaurant.html?id=${restaurant.id}`);
	}

	/**
	 * Restaurant image URL.
	 */
	static imageUrlForRestaurant(restaurant) {
		return (`/img/${restaurant.photograph}`);
	}

	/**
	 * Restaurant image alt text
	 */
	static imageAltForRestaurant(restaurant) {
		return restaurant.imgAlt
	}

	/**
	 * Map marker for a restaurant.
	 */
	static mapMarkerForRestaurant(restaurant, map) {
		const marker = new google.maps.Marker({
			position: restaurant.latlng,
			title: restaurant.name,
			url: DBHelper.urlForRestaurant(restaurant),
			map: map,
			animation: google.maps.Animation.DROP
		}
		);
		return marker;
	}

}
