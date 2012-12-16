define(['fs', 'hulk-hogan', './public/js/lib/agave.js'], function(fs, hogan, agave){

  agave.enable();

  // HTTP clients that are listening for updates
  var clients_awaiting_updates = [];

  // How often to send a 'comment' update to keep browsers connected. In secs.
  var BROWSER_KEEPALIVE_INTERVAL = 40;

  // Message ID used for server sent events
  var message_id = 0;

  // How long for browsers to wait if the server doesn't respond to our request for messages. In ms.
  var SSE_ERROR_RETRY = 5000;

  // Fail and exit if a critical error occurs
  var die = function(reason) {
    console.log(reason);
    process.exit(1);
  };

  // Die if err is defined
  var dieIfError = function(err) {
    if ( err ) {
      console.log('Error:');
      die(err);
    }
  };

  // Finish a response by sending the data mentioned as an SSE stream (using JSON for the data)
  // See http://www.html5rocks.com/en/tutorials/eventsource/basics/
  var respondWithStream = function(response, data, comment) {
    var response_contents = {
      id: message_id,
      retry: SSE_ERROR_RETRY,
      data: JSON.stringify(data)
    }
    var response_contents_flattened = '';
    if ( comment ) {
      response_contents_flattened += ':'+comment+'\n';
    }
    for ( var key in response_contents ) {
      response_contents_flattened += key+': '+response_contents[key]+'\n';
    }
    response.write(response_contents_flattened += '\n'); // Not end.
    message_id += 1;
  }

  //
  var addBrowserToQueue = function(response) {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });
    clients_awaiting_updates.push(response);
  };

  // Respond to all browsers awaiting an update
  var finishResponses = function(message) {
    console.log('Sending update to', clients_awaiting_updates.length, 'awaiting clients...')
    clients_awaiting_updates.forEach( function(response) {
      respondWithStream(response, message)
    });
  }

  return {
    respondWithStream:respondWithStream,
    addBrowserToQueue:addBrowserToQueue,
    clients_awaiting_updates:clients_awaiting_updates,
    finishResponses:finishResponses
  }
})

