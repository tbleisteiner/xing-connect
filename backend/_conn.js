'use strict';

var OAuth = require('oauth'),
    request = require('request'),
    errorHandling = require('ll-error-handling');

var xingConfig = global.config.apiConfigs.xing,
    oauth = new OAuth.OAuth(
        'https://api.xing.com/request_token',
        'https://api.xing.com/access_token',
        xingConfig.key,
        xingConfig.secret,
        '1.0',
        null,
        'HMAC-SHA1'
    );

exports.initialize = function(app) {

    app.get('/api/connectors/xing/dataByEmailAddress/:address', function(req, res) {

        if (!req.user.xingCreds) {
            return res.send(401, 'No valid XING token found');
        }

        var xingCreds = req.user.xingCreds; //TODO: Entschlüsseln

        oauth.get(
            'https://api.xing.com/v1/users/find_by_emails.json?emails=' + req.params.address + '&user_fields=business_address,first_name,last_name,photo_urls,permalink',
            xingCreds.token,
            xingCreds.secret,
            function (err, data){
                if (err) {
                    errorHandling.sendFiveHundred(res, err, 'xing dataByEmailAddress oauth');
                }
                else {
                    var xingResponse = JSON.parse(data),
                        xingEntry = xingResponse.results.items[0];

                    if (xingEntry) {
                        var xingUser = xingEntry.user,
                            imageUrl = xingUser.photo_urls.large;

                        xingUser._extensions = {};

                        request({uri: imageUrl, encoding: null}, function (error, response, body) {
                            if (!error && response.statusCode === 200) {
                                var type = response.headers['content-type'],
                                    prefix = 'data:' + type + ';base64,',
                                    base64 = body.toString('base64'),
                                    url = prefix + base64;
                                xingUser._extensions.picture = url;
                                res.send(xingResponse);
                            }
                            else {
                                res.send(xingResponse);
                            }
                        });
                    }
                    else {
                        res.send(xingResponse);
                    }
                }
            }
        );
    });

    var picCache = {};
    app.get('/api/connectors/xing/picByEmailAddress/:address', function(req, res) {

        var cached = picCache[req.params.address];
        if (cached) {
            return res.redirect(cached);
        }

        if (!req.user.xingCreds) {
            return res.send(401, 'No valid XING token found');
        }

        var xingCreds = req.user.xingCreds; //TODO: Entschlüsseln

        oauth.get(
            'https://api.xing.com/v1/users/find_by_emails.json?emails=' + req.params.address + '&user_fields=photo_urls',
            xingCreds.token,
            xingCreds.secret,
            function (err, flatData){
                if (err) {
                    errorHandling.sendFiveHundred(res, err, 'xing picByEmailAddress oauth');
                }
                else {
                    var data = JSON.parse(flatData);
                    var xingUser = data.results.items[0].user;
                    if (!xingUser) {
                        return res.send(404);
                    }
                    var picUri = xingUser.photo_urls.maxi_thumb;
                    picCache[req.params.address] = picUri;
                    res.redirect(picUri);
                }
            }
        );

    });
};
