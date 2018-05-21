let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = async () => {
	try {
		const restaurant = await fetchRestaurantFromURL()
		self.map = new google.maps.Map(document.getElementById('map'), {
			zoom: 16,
			center: restaurant.latlng,
			scrollwheel: false
		});
		fillBreadcrumb();
		DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
	} catch (error) {
		console.error(error);
	}

	google.maps.event.addListener(map, 'tilesloaded', function (evt) {

		const mapDivs = document.querySelectorAll('#map [tabindex="0"]')

		mapDivs.forEach(m => {
			m.setAttribute('tabindex', "-1")
		})

		//a11y
		document.querySelector('#map > div > div > iframe').title = 'Embedded Google Maps Iframe'
	});
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = async () => {
	if (self.restaurant) { // restaurant already fetched!
		return self.restaurant
	}
	const id = getParameterByName('id');
	if (!id) { // no id found in URL
		let error = 'No restaurant id in URL'
		return error
	} else {
		const restaurant = await DBHelper.fetchRestaurantById(id)
		self.restaurant = restaurant;
		if (!restaurant) {
			console.error(error);
			return;
		}
		fillRestaurantHTML();
		return restaurant
	}
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
	const name = document.getElementById('restaurant-name');
	name.setAttribute('aria-label', `Restaurant: ${restaurant.name}`);
	name.innerHTML = restaurant.name;

	const address = document.getElementById('restaurant-address');
	address.setAttribute('aria-label', `Address: ${restaurant.address}`);
	address.innerHTML = restaurant.address;

	const image = document.getElementById('restaurant-img');
	image.className = 'restaurant-img'
	image.src = DBHelper.imageUrlForRestaurant(restaurant);
	image.alt = DBHelper.imageAltForRestaurant(restaurant);

	const cuisine = document.getElementById('restaurant-cuisine');
	cuisine.setAttribute('aria-label', `Cuisine: ${restaurant.cuisine_type}`);
	cuisine.innerHTML = restaurant.cuisine_type;

	// fill operating hours
	if (restaurant.operating_hours) {
		fillRestaurantHoursHTML();
	}
	// fill reviews
	fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
	const hours = document.getElementById('restaurant-hours');
	const caption = document.createElement('caption');
	caption.setAttribute('aria-label', 'Restaurant hours')
	hours.appendChild(caption);

	for (let key in operatingHours) {
		const row = document.createElement('tr');
		// row.setAttribute('tabindex', '0');

		const day = document.createElement('td');
		day.innerHTML = key;
		row.appendChild(day);

		const time = document.createElement('td');
		time.innerHTML = operatingHours[key];
		row.appendChild(time);

		hours.appendChild(row);
	}
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
	const container = document.getElementById('reviews-container');
	const title = document.createElement('h2');
	title.innerHTML = 'Reviews';
	title.tabIndex = 0;
	title.id = 'reviews';
	container.appendChild(title);

	if (!reviews) {
		const noReviews = document.createElement('p');
		noReviews.innerHTML = 'No reviews yet!';
		noReviews.tabIndex = 0;
		container.appendChild(noReviews);
		return;
	}
	const ul = document.getElementById('reviews-list');
	reviews.forEach(review => {
		ul.appendChild(createReviewHTML(review));
	});
	container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
	const li = document.createElement('li');
	const name = document.createElement('p');
	name.innerHTML = review.name;
	li.appendChild(name);

	const date = document.createElement('p');
	date.innerHTML = review.date;
	li.appendChild(date);

	const rating = document.createElement('p');
	rating.innerHTML = `Rating: ${review.rating}`;
	li.appendChild(rating);

	const comments = document.createElement('p');
	comments.innerHTML = review.comments;
	li.tabIndex = 0;
	li.appendChild(comments);

	return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
	const breadcrumb = document.getElementById('breadcrumb');
	const li = document.createElement('li');
	li.innerHTML = restaurant.name;
	breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
	if (!url)
		url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results)
		return null;
	if (!results[2])
		return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
