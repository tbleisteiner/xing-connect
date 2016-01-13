'use strict';

var passport = require('passport'),
    XingStrategy = require('passport-xing').Strategy,
    authCommons = require('./authenticator-commons.js');

var xingConfig = global.config.apiConfigs.xing;

exports.initialize = function(app) {

    app.get('/xing/getToken/ui', authCommons.authenticateViaQueryToken, authCommons.storeContextInSession, passport.authenticate('xing'));

    app.get('/xing/getToken/ui/callback', passport.authenticate('xing'), function(req, res) {
        var userData = { 
            xingCreds: {
                token: req.user.token,
                secret: req.user.secret
            }
        };
    
        return authCommons.storeAndRedirect(req, res, userData);
    });

    initializeXingAuth();
};


function initializeXingAuth() {

        passport.use('xing', new XingStrategy({
            consumerKey: xingConfig.key,
            consumerSecret: xingConfig.secret,
            callbackURL: xingConfig.callback
          },
          function(token, tokenSecret, profile, done) {
              return done(null, {token: token, secret: tokenSecret, profile: profile});
          }
        )
    );
}
