'use strict';

// load the things we need
const LocalStrategy     = require('passport-local').Strategy;

// load up the user model
const User              = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    //======================================
    // passport session setup ===============
    //======================================
    // needed to serialize the user for the sessions

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserialize the users

    passport.serializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    //======================================
    // LOCAL SIGNUP =========================
    //======================================

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // so whole request can be passed to callback
    }));

    function(req, email, password, done) { // callback with email and password from form
        // find a user whose email is the same as the forms email
        // checking to see if user logging in already exists
        User.findOne({ 'local.email' : email }, function(err, user) {
            // if there are any errors, return them before anything else
            if (err)
                return done(err);

            // check to see if there is already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken'));
            } else {
                // if there is no user with that email create one
                const newUser          = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);

                // save the users
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });
    },
};
