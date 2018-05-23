const staticCache = 'mws-p1-static-cache-1'
const dynamicCache = 'mws-p1-dynamic-cache-1'
const staticUrlsToCache = [
	'./',
	'index.html',
	'css/styles.css',
	'js/main.js',
	'js/dbhelper.js',
	'data/restaurants.json'
]

const cacheStaticRessources = async () => {
	const cache = await caches.open(staticCache)
	await cache.addAll(staticUrlsToCache)
	console.log('cached static ressources')
}

const useRessourceStrategy = async request => {
	try {
		const response = await caches.match(request)
		if (response) {
			return response
		} else {
			addRessourceToDynamicCache(request)
			return fetch(request)

		}
	} catch (error) {
		console.log(error)
		return fetch(request)
	}

}

const addRessourceToDynamicCache = async (url) => {
	try {
		const dynCache = await caches.open(dynamicCache)
		const res = await fetch(url)
		dynCache.put(url, res);
	} catch (error) {
		console.log(error)
	}

}

self.addEventListener('install', event => {
	console.log('SW: Install Event')
	event.waitUntil(cacheStaticRessources());
})

self.addEventListener('activate', event => {
	console.log('SW: Activate Event')
})

self.addEventListener('fetch', event => {
	if (event.request.url.startsWith(self.location.origin)) {
		event.respondWith(useRessourceStrategy(event.request))
	}
})
