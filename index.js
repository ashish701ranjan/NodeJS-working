/*
 * Primary file for API
*/

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// The server should respond to all string with a string
var server = http.createServer(function(req, res){

	// Get the URL and parse it
	var parsedUrl = url.parse(req.url, true);

	// Get the path from the  URL
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g, '');

	// Get the query string
	var queryStringParams = parsedUrl.query;
	 
	// Get the method
	var method = req.method.toLowerCase();

	// Get the headers
	var headers = req.headers;

	// Get the payload, if any
	var decoder = new StringDecoder('utf-8');
	var payload = '';
	req.on('data', function(data) {
		payload += decoder.write(data);
	})

	req.on('end', function() {
		payload += decoder.end();

		// data to send to the route handler
		var data = {
			payload: payload,
			path: trimmedPath,
			queryString: queryStringParams,
			method: method,
			headers: headers
		}

		var chosenHandler = trimmedPath in routes ? handlers[trimmedPath] : handlers['notFound'];

		// call the handler
		chosenHandler(data, function(status, payload) {
			 status = typeof status === 'number' ? status : 200;
			 payload = typeof payload === 'object' ? payload : {};
			res.setHeader('Content-Type', 'application/json');
			 res.writeHead(status);
			// Send The request
			res.end(JSON.stringify(payload));
			console.log('Response sent: ', payload, 'with status', status);
		});
	});

	// lets define the handlers
	var handlers = {
		'sample': function(data, callback) {
			callback(406, {'name': 'SampleHandler'})
		},
		'notFound': function(data, callback) {
			callback(404);
		}
	};

	// lets define the routes
	var routes = {
		'sample': handlers.sample
	}

})

// Start the server and have it listen on the port 3000
server.listen(3000, function() {
	console.log("The server is listening on port 3000 now");
});