const staticCache = 'mws-p1-static-cache-1';
const dynamicCache = 'mws-p1-dynamic-cache-1';
const staticUrlsToCache = [
	'./',
	'index.html',
	'css/styles.css',
	'js/main.js',
	'js/dbhelper.js',
	'data/restaurants.json',
	'404.html',
	'offline.html',
	'restaurant.html'
];

const cacheStaticRessources = async () => {
	const cache = await caches.open(staticCache);
	try {
		await cache.addAll(staticUrlsToCache);
		console.log('cached static ressources');
	} catch (error) {
		console.log(`An error happened during static assets caching: ${error}`); //TODO: better error handling and more detailed error
	}
};

const useRessourceStrategy = async request => {
	try {
		const response = await caches.match(request);
		if (response) {
			//if in cache use cache
			return response;
		} else {
			//if not in cache try to fetch using internet
			const fetchResponse = await fetch(request);
			//if response 404 (does not exist)
			if (fetchResponse.status === 404) {
				// use offline fallback page
				const fallbackPage = await caches.match('404.html');
				return fallbackPage;
			} else {
				addRessourceToDynamicCache(request, fetchResponse.clone());
				return fetchResponse;
			}
		}
	} catch (error) {
		console.log(error);
		const offlinePage = await caches.match('offline.html');
		return offlinePage;
	}
};

const addRessourceToDynamicCache = async (request, res) => {
	try {
		const dynCache = await caches.open(dynamicCache);
		dynCache.put(request, res);
	} catch (error) {
		console.log(error);
	}
};

self.addEventListener('install', event => {
	console.log('SW: Install Event');
	event.waitUntil(cacheStaticRessources());
});

self.addEventListener('activate', event => {
	console.log('SW: Activate Event');
});

self.addEventListener('fetch', event => {
	if (event.request.url.startsWith(self.location.origin)) {
		event.respondWith(useRessourceStrategy(event.request));
	}
});
