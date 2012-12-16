// The browser based updater app
define(['lib/agave'], function(agave){

  agave.enable();

  DEBUG = false;//true;

  var $ = function(selector) {
    return document.querySelector(selector);
  };
  var $all = function(selector) {
    return document.querySelectorAll(selector);
  };

  var log = function(){
    if ( DEBUG ) {
      console.log(message)
    }
  }

  var MAX_UPDATE_FAILURES = 2;
  var update_failures = 0;

  // Listen for server sent events
  var setupUpdateListener = function(callback){
    // Recieve messages and do stuff with them
    if ( window.EventSource) {
      log('Listening for server sent events.');
      var source = new EventSource('/updates');
      source.addEventListener('message', function(event) {
        log('yaay')
        update_failures = 0
        var data = JSON.parse(event.data);
        if ( data ) {
          log('Got an update, woo:', data)
          callback(data)
        }
      }, false);
      // Don't bother harassing server continually if we lost the connection
      source.addEventListener('error', function(event) {
        if (event.eventPhase == EventSource.CLOSED) {
          update_failures += 1;
          if ( update_failures >= MAX_UPDATE_FAILURES ) {
            log('Updating failed too often. Your internet is probably broken.')
            source.close();
          }
        }
      }, false);

    } else {
      alert('You need a browser that supports HTML5 server sent events to use this app. Get Chrome or Firefox.')
    }
  }

  setupUpdateListener(function(data){
    log(data)
    $('time').textContent = data.time
  });
})

