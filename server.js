var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('./config');
var app = express();
var googleProfile = {};

// uruchomienie Passporta
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// autoryzacja Passpota do Google
passport.use(new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret:config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, cb) {
        googleProfile = {
            id: profile.id,
            displayName: profile.displayName
        };
        cb(null, profile);
    }
));

//silnik widoków i inicjalizacja Passporta
app.set('view engine', 'pug');
app.set('views', './views');
app.use('/static', express.static("assets"));
app.use(passport.initialize());
app.use(passport.session());

//app routes
app.get('/', function(req, res) {
    res.render('index', { user: req.user });
});

app.get('/logged', function(req, res) {
    res.render('logged', { user: googleProfile });
});

app.get('/logout', function(req, res) {
    googleProfile = null;
    req.logOut();
    res.redirect('/');
});
//Passport routes
app.get('/auth/google',
passport.authenticate('google', {
scope : ['profile', 'email']
}));
app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect : '/logged',
        failureRedirect: '/'
    }));

app.listen(3000);
