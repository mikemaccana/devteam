#!/usr/bin/env node
/*jshint asi:true */

// Modules
var requirejs = require('requirejs');
requirejs.config({ nodeRequire: require, baseUrl: "lib" });
requirejs(['express', 'utils', 'hulk-hogan', './public/js/lib/agave.js'], function (express, utils, hulk, agave) {
  agave.enable();

  var PORT = 3000
  var app = express();

  // Set up holk hogan
  app.set('views', __dirname + '/views');
  app.set('view options', {layout: false});
  app.set('view engine', 'hulk');
  console.log('_'.repeat(80))
  app.engine('hulk', hulk.__express);

  // Public folders
  app.use('/static', express.static(__dirname + '/public'));

  // Overall view
  app.get('/', function(request, response){
    console.log('Visit to /');
    response.render('index', {
      title: 'devteam'
    });
  });

  // Overall view
  app.get('/updates', function(request, response){
    console.log("Adding new client to update queue")
    // Requests for server side event updates.
    // We send headers, and write data, but we never end the response. This is how SSE streams work.
    utils.addBrowserToQueue(response);
  });

  // Send time update every 3 seconds
  setInterval(function(){
    var time = (new Date).toString()
    utils.finishResponses({time: time})
  }, 3 * 1000)

  app.listen(PORT);
  console.log('Server now running on', PORT)
})








//       // Send 'keep alive' messages every so often so browsers stay connected
//       setInterval(function(){
//         clients_awaiting_updates.forEach( function(response) {
//           utils.respondWithStream(response, null, 'keepalive')
//         });
//       }, BROWSER_KEEPALIVE_INTERVAL * 1000)
