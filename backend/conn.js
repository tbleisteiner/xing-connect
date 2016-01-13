'use strict';

var passport = require('passport'),
	request = require('request'),
	OAuth = require('oauth');

exports.init = function(app) {

	var oauth = new OAuth.OAuth(
		'https://api.xing.com/request_token',
		'https://api.xing.com/access_token',
		global.config.auth.xingKey,
		global.config.auth.xingSecret,
		'1.0',
		null,
		'HMAC-SHA1'
	);


	app.get('/api/xing/search', function(req, res) {

		var requestUri = 'https://api.xing.com/v1/users/find_by_emails.json?emails=';
		requestUri += req.query.emails;
		requestUri += '&user_fields=';
		requestUri += 'display_name,photo_urls.large,birth_date,haves,business_address.phone';
		// requestUri += '&oauth_token=' + global.user.token;
		//  requestUri += '&oauth_signature_method=HMAC-SHA1'; //'&oauth_consumer_key=' + global.config.auth.xingKey + 

		oauth.get(
			requestUri,
			global.user.token,
			global.user.secret,
			function(err, data) {
				if (err) {
					console.log(err);
					res.sendStatus(500);
				} else {
					var response = JSON.parse(data);

					res.send(response.results);
				}


			}
		);



		// request({ uri: requestUri}, function(error, response, body) {
		// 	res.send(JSON.stringify({ error: error, response: response, body: body}));
		// });
	});


};