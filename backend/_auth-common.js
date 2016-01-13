'use strict';

var db = require('../../base/es-client.js'),
    errorHandling = require('ll-error-handling'),
    jwt = require('jsonwebtoken');

exports.storeAndRedirect = function(req, res, userData) {
    var aardvarkUser = req.session.aardvarkUser,
        conn = db.getOrCreateConnectionForUser(aardvarkUser);

    conn.update('$user', aardvarkUser.id, userData) //TODO: Verschlüsselt ablegen
    .then(function () {
        if (req.session.message) {
            return res.send('<script>window.parent.postMessage(\'' + req.session.message  + '\',\'*\');</script>');
        }
        else {
            return res.redirect(req.session.returnUri);
        }
    })
    .catch(function(err) {
        return errorHandling.sendFiveHundred(res, err, 'Authenticator storeAndRedirect');
    });
};

exports.storeContextInSession = function(req, res, next) {
    req.session.message = req.query.message;
    req.session.returnUri = req.query.returnUri || '/';
    req.session.aardvarkUser = req.user;
    next();
};

exports.authenticateViaQueryToken = function(req, res, next) {
    var token = req.query.authorization;
    if (!token) {
        return res.status(403).send('missing authorization parameter');
    }
    jwt.verify(token, global.config.auth.tokenSecret, function(err, decoded) {
        if (err) {
            return res.status(403).send('invalid authorization token');
        }

        req.user = decoded;
        next();
    });
};
