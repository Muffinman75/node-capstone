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
    // app.post('/login', do all passport stuff here);

    //=========================
    // SIGNUP (show signup form)
    //=========================
    app.get('/signup', function(req,res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') }); // same as above
    });

    // process the signup form
    //app.post('/signup', do all our passport stuff here);

    //=========================
    // PROFILE SECTION ========
    //=========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', { user : req.user }); // get user out of session and pass to template
    });

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
