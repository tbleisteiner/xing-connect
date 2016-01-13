'use strict';

var passport = require('passport'),
    XingStrategy = require('passport-xing').Strategy,
    session = require('express-session'),
    cookieParser = require('cookie-parser');

exports.init = function(app) {

    app.use(cookieParser());
    app.use(session({
        secret: global.config.auth.tokenSecret,
        saveUninitialized: true,
        resave: true
    }));

    app.use(passport.initialize());
    app.use(passport.session());


    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
    passport.use('xing', new XingStrategy({
            consumerKey: global.config.auth.xingKey,
            consumerSecret: global.config.auth.xingSecret,
            callbackURL: global.config.auth.callback
        },
        function(token, tokenSecret, profile, done) {
            return done(null, {
                token: token,
                secret: tokenSecret,
                profile: profile
            });
        }
    ));


    app.get('/api/auth', passport.authenticate('xing'));

    app.get('/api/callback', passport.authenticate('xing'), function(req, res) {
        res.send(JSON.stringify({
                token: req.user.token,
                secret: req.user.secret
            }

        ));
    });
};