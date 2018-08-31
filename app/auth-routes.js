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

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    // router.get('/auth/facebook', passport.authenticate('facebook', {
    //   scope : ['public_profile', 'email']
    // }));
    //
    // // handle the callback after facebook has authenticated the user
    // router.get('/auth/facebook/callback',
    //     passport.authenticate('facebook', {
    //         successRedirect : '/profile',
    //         failureRedirect : '/'
    //     }));
    // =====================================
    // TWITTER ROUTES ======================
    // =====================================
    // route for twitter authentication and login
    // router.get('/auth/twitter', passport.authenticate('twitter'));
    //
    // // handle the callback after twitter has authenticated the user
    // router.get('/auth/twitter/callback',
    //     passport.authenticate('twitter', {
    //         successRedirect : '/profile',
    //         failureRedirect : '/'
    //     }));

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    // router.get('/auth/google', passport.authenticate('google', { scope :['profile', 'email'] }));
    //
    // // the callback after google has authenticated the user
    // router.get('/auth/google/callback',
    //     passport.authenticate('google', {
    //         successRedirect : '/profile',
    //         failureRedirect : '/'
    //     }));

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

    // facebook -------------------------------

    // send to facebook to do the authentication
    // router.get('/connect/facebook', passport.authorize('facebook', {
    //      scope : ['public_profile', 'email']
    // }));
    //
    // // handle the callback after facebook has authorized the user
    // router.get('/connect/facebook/callback',
    //     passport.authorize('facebook', {
    //         successRedirect : '/profile',
    //         failureRedirect : '/'
    //     }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    // router.get('/connect/twitter', passport.authorize('twitter', { scope : 'email'}));
    //
    // // handle the callback after twitter has authorized the user
    // router.get('/connect/twitter/callback',
    //     passport.authorize('twitter', {
    //         successRedirect : '/profile',
    //         failureRedirect : '/'
    //     }));

    // google ---------------------------------

    // send to google to do the authentication
    // router.get('/connect/google', passport.authorize('google', { scope :['profile', 'email'] }));
    //
    // // the callback after google has authorized the user
    // router.get('/connect/google/callback',
    //     passport.authorize('google', {
    //         successRedirect : '/profile',
    //         failureRedirect : '/'
    //     }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // // local -----------------------------------
    // router.get('/unlink/local', function(req, res) {
    //     const user            = req.user;
    //     user.local.email    = undefined;
    //     user.local.password = undefined;
    //     user.save(function(err) {
    //         res.redirect('/profile');
    //     });
    // });

    // // facebook -------------------------------
    // router.get('/unlink/facebook', function(req, res) {
    //     const user            = req.user;
    //     user.facebook.token = undefined;
    //     user.save(function(err) {
    //         res.redirect('/profile');
    //     });
    // });

    // twitter --------------------------------
    // router.get('/unlink/twitter', function(req, res) {
    //     const user           = req.user;
    //     user.twitter.token = undefined;
    //     user.save(function(err) {
    //        res.redirect('/profile');
    //     });
    // });

    // // google ---------------------------------
    // router.get('/unlink/google', function(req, res) {
    //     const user          = req.user;
    //     user.google.token = undefined;
    //     user.save(function(err) {
    //        res.redirect('/profile');
    //     });
    // });

};
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in session then carry on
    if (req.isAuthenticated())
        return next();

    // if not authenticated, redirected to homepage
    res.redirect('/');
}