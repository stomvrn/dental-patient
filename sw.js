/* urn:vanxo:artifact:dental-patient:sw:1.0.1 */
'use strict';

var CACHE_NAME = 'dental-patient-v1.0.1';
var PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(PRECACHE);
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event){
  var req = event.request;
  if(req.method !== 'GET') return;
  var url = new URL(req.url);
  if(url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then(function(hit){
      if(hit) return hit;
      return fetch(req).then(function(resp){
        if(!resp || resp.status !== 200 || resp.type !== 'basic'){
          return resp;
        }
        var copy = resp.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(req, copy);
        });
        return resp;
      }).catch(function(){
        return caches.match('./index.html');
      });
    })
  );
});
