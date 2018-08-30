module.exports = function(app, passport) {

    // =========================
    // HOME PAGE (with login links)
    // =========================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // loads index.ejs file
    });

    // =========================
    // LOGIN PAGE (show login form)
    // =========================
    app.get('/login', function(req,res) {
        res.render('login.ejs', { message: req.flash('loginMessage') }); // render the page and pass in any flash data if it exists
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to secure profile section
        failureRedirect : '/login', // back to signup if there's an error
        failureFlash : true // allow flash messages
    }));

    //=========================
    // SIGNUP (show signup form)
    //=========================
    app.get('/signup', function(req,res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') }); // same as above
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect to signup on error
        failureFlash    : true // allow flash messages
    }));

    //=========================
    // PROFILE SECTION ========
    //=========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', { user : req.user }); // get user out of session and pass to template
    });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', {
      scope : ['public_profile', 'email']
    }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

        //========================
        // LOGOUT ================
        //========================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

};
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in session then carry on
    if (req.isAuthenticated())
        return next();

    // if not authenticated, redirected to homepage
    res.redirect('/');
}
