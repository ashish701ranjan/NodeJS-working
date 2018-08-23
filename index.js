/*
 * Primary file for API
*/

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// https server options
var httpsServerOptions = {
	'key': fs.readFileSync('./https/key.pem'),
	'cert': fs.readFileSync('./https/cert.pem')
}

var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
	unifiedServer(req, res);
});

// start the HTTPS server
httpsServer.listen(config.httpsPort, function() {
	console.log(`HTTPS server is listening on port ${config.httpsPort} now and the environmemt is ${config.environmentName}`);
})

// The server should respond to all string with a string
var httpServer = http.createServer(function(req, res){
	unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function() {
	console.log(`HTTP server is listening on port ${config.httpPort} now and the environmemt is ${config.environmentName}`);
});



// common logic for http and https
var unifiedServer = function(req, res) {
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

		console.log(chosenHandler);

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
		'ping': function(data, callback) {
			callback(200)
		},
		'notFound': function(data, callback) {
			callback(404);
		}
	};

	// lets define the routes
	var routes = {
		'ping': handlers.ping
	}
}