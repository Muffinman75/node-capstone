const express = require('express');
const router = express.Router();


module.exports = function(router, passport) {

    // =========================
    // HOME PAGE (with login links)
    // =========================
    router.get('/', function(req, res) {
        res.render('login-pages/index.ejs'); // loads index.ejs file
    });

    // =========================
    // LOGIN PAGE (show login form)
    // =========================
    router.get('/login', function(req,res) {
        res.render('login-pages/login.ejs', { message: req.flash('loginMessage') }); // render the page and pass in any flash data if it exists
    });

    // process the login form
    router.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to secure profile section
        failureRedirect : '/login', // back to signup if there's an error
        failureFlash : true // allow flash messages
    }));

    //=========================
    // SIGNUP (show signup form)
    //=========================
    router.get('/signup', function(req,res) {
        res.render('login-pages/signup.ejs', { message: req.flash('signupMessage') }); // same as above
    });

    // process the signup form
    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect to signup on error
        failureFlash    : true // allow flash messages
    }));

    //=========================
    // PROFILE SECTION ========
    //=========================
    router.get('/profile', isLoggedIn, function(req, res) {
        res.render('login-pages/profile.ejs', { user : req.user }); // get user out of session and pass to template
    });

    // route for twitter authentication and login
    router.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    router.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

        //========================
        // LOGOUT ================
        //========================
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // locally --------------------------------
    router.get('/connect/local', function(req, res) {
        res.render('login-pages/connect-local.ejs', { message: req.flash('loginMessage') });
    });
    router.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

};
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in session then carry on
    if (req.isAuthenticated())
        return next();

    // if not authenticated, redirected to homepage
    res.redirect('/');
}
