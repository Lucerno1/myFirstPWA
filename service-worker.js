const cacheName = "cache2";
const appFiles = [
    "/manifest.json",
    "/js/scripts.js",
    "/css/stylesheet.css",
    "/images/yes.gif",
    "/images/icons/icon-128x128.png",
    "/images/icons/icon-144x144.png",
    "/images/icons/icon-152x152.png",
    "/images/icons/icon-192x192.png",
    "/images/icons/icon-384x384.png",
    "/images/icons/icon-512x512.png",
    "/images/icons/icon-72x72.png",
    "/images/icons/icon-96x96.png",
    "/",
    "/index.html"
    
];

self.addEventListener("install", (installing) => {
    
    console.log("Service Worker: I am being installed, hello world!");

    //Put important offline files in cache on installation of the service worker
    installing.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log("Service Worker: Caching important offline files");
            return cache.addAll(appFiles);
        })
    );
});

self.addEventListener("activate", (activating) => {
    console.log("Service Worker: All systems online, ready to go!");
});

self.addEventListener("fetch", (fetching) => {
    console.log("Service Worker: User threw a ball, I need to fetch it!");

    // Always load with the cached files if available
    fetching.respondWith(
    caches.match(fetching.request.url).then((response)=>{
        console.log("Service Worker: Fetching resource "+fetching.request.url);
        return response||fetch(fetching.request).then((response)=>{
        console.log("Service Worker: Resource "+fetching.request.url+" not available in cache");
        return caches.open(cacheName).then((cache) => {
            console.log("Service Worker: Caching (new) resource "+fetching.request.url);
            cache.put(fetching.request,response.clone());
            return response;
        });
        }).catch(function(){      
        console.log("Service Worker: Fetching online failed, HAALLPPPP!!!");
        //Do something else with the request (respond with a different cached file)
        })
    }))

});

self.addEventListener("push", (pushing) => {
    
    
    if (pushing.data) {
        pushdata = JSON.parse(pushing.data.text());
        console.log("Service Worker: I received this:", pushdata);
        if ((pushdata["title"] != "") && (pushdata["message"] != "")) {
            const options = {
                body: pushdata["message"]
            }
            self.registration.showNotification(pushdata["title"], options);
            console.log("Service Worker: I made a notification for the user");
        } else {
            console.log("Service Worker: I didn't make a notification for the user, not all the info was there :(");
        }
    }

    
    console.log("Service Worker: I received some push data, but because I am still very simple I don't know what to do with it :(");
})



//Asking for permission with the Notification API
if (typeof Notification !== typeof undefined) { //First check if the API is available in the browser
    Notification.requestPermission().then(function (result) {
        //If accepted, then save subscriberinfo in database
        if (result === "granted") {
            console.log("Browser: User accepted receiving notifications, save as subscriber data!");
            navigator.serviceWorker.ready.then(function (serviceworker) { //When the Service Worker is ready, generate the subscription with our Serice Worker's pushManager and save it to our list
                const VAPIDPublicKey = "BPKwxO6GiIh3enjXrV5yNf3g34HImk9tM9rYKogNXwlv-Ae-x5pfOyfC0afE9X60pAnK6LLy0WGsCaZ8fULsWIY"; // Fill in your VAPID publicKey here
                const options = {
                    applicationServerKey: VAPIDPublicKey,
                    userVisibleOnly: true
                } //Option userVisibleOnly is neccesary for Chrome
                serviceworker.pushManager.subscribe(options).then((subscription) => {
                    //POST the generated subscription to our saving script (this needs to happen server-side, (client-side) JavaScript can't write files or databases)
                    let subscriberFormData = new FormData();
                    subscriberFormData.append("json", JSON.stringify(subscription));
                    fetch("data/saveSubscription.php", {
                        method: "POST",
                        body: subscriberFormData
                    });
                });
            });
        }
    }).catch((error) => {
        console.log(error);
    });
}