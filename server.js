"use strict";

// import all the tools needed
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");

const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const cron = require("node-cron");
const configDB = require("./config/database.js");

require("run-middleware")(app);

mongoose.connect(
  configDB.url,
  { useNewUrlParser: true }
); // connect to the database

require("./config/passport")(passport); // pass passport for configuration

// set up the express application
app.use(morgan("dev")); // log each request to the console
app.use(cookieParser()); // read cookies (needed for oauth)
app.use(bodyParser.urlencoded({ extended: true })); // get info from html forms
app.use(express.static("public"));
app.set("view engine", "ejs"); // set up ejs for templating

// required for passport

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "smellybellystringbean"
  })
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistant login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require("./app/auth-routes.js")(app, passport); // load the routes and pass in the app and configured passport
require("./app/game-routes.js")(app);

// cron.schedule("*/10 * * * * *", () => {
//   console.log("cron running");
//   app.runMiddleware("/checkPredictions", function(response) {
//     //console.log("checkPredictions response", response);
//     app.runMiddleware("/updatePoints", function(response) {
//       //console.log("updatePoints response", response);
//     });
//   });
// });

app.listen(port);
console.log("communicating through port " + port);
