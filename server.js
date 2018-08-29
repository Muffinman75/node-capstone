'use strict';

// import all the tools needed
const express   = require('express');
const app       = express();
const port      = process.env.PORT || 8080;
const mongoose  = require('mongoose');
const passport  = require('passport');
const flash     = require('connect-flash');

const morgan        = require('morgan');
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');
const session       = require('express-session');

const configDB = require('./config/database.js');

mongoose.connect(configDB.url, { useNewUrlParser : true }); // connect to the database

require('./config/passport')(passport); // pass passport for configuration

// set up the express application
app.use(morgan('dev')); // log each request to the console
app.use(cookieParser()); // read cookies (needed for oauth)
app.use(bodyParser()); // get info from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport

app.use(session({ secret: 'smellybellystringbean' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistant login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./app/routes.js')(app, passport); // load the routes and pass in the app and configured passport

app.listen(port);
console.log('communicating through port ' + port);
