const express = require("express");
const requestPromise = require("request-promise");
const mongoose = require("mongoose");
const parser = require("body-parser");

const router = express.Router();

const user = require("../app/models/user");
const { Predictions } = require("../app/models/prediction");
const configAuth = require("../config/auth");

// Endpoint called from cron job in server.js - to check predictions for each user
// against the results for the given matchday if they are in.
module.exports = function(router) {
  router.get("/checkPredictions", function(req, res) {
    requestPromise({
      method: "GET",
      uri: "https://api.football-data.org/v2/competitions/PL/matches",
      json: true,
      headers: {
        "X-Auth-Token": configAuth.footballToken
      },
      rejectUnauthorized: false
    }).then(data => {
      if (!data) {
        const message = "No Footy Data";
        console.error(message);
        return res.status(404).send(message);
      }
      // get the matchDay from the API
      let matchday = data.matches[0].season.currentMatchday;
      let numberofPredictions = 0;
      let completedPredictions = 0;
      // go grab all Predictions for this matchDay
      console.log("matchday:", matchday);
      Predictions.find({ matchDay: matchday }, function(err, predictions) {
        // loop through all predictions and matches - nested loops not the best way
        numberofPredictions = predictions.length;
        console.log("found predictions,", numberofPredictions);
        console.log("number of matches", data.matches.length);
        for (let i = 0; i < predictions.length; i++) {
          for (let j = 0; j < data.matches.length; j++) {
            if (data.matches[j].matchday == matchday) {
              fixture = search(
                data.matches[j].homeTeam.name,
                data.matches[j].awayTeam.name,
                predictions[i].fixtures
              );
              if (data.matches[j].score.winner !== null) {
                predictions[i].fixtures[fixture].winner =
                  data.matches[j].score.winner;
                if (
                  data.matches[j].score.winner.replace("_TEAM", "") ==
                  predictions[i].fixtures[fixture].prediction.replace(
                    "_WIN",
                    ""
                  )
                ) {
                  debugger;
                  predictions[i].fixtures[fixture].result = 1;
                }
              } else {
                break;
              }
            }
          }
          predictions[i].save();
          checkComplete();
        }
      });

      function search(homeTeam, awayTeam, myArray) {
        for (let i = 0; i < myArray.length; i++) {
          if (
            myArray[i].home_team === homeTeam &&
            myArray[i].away_team === awayTeam
          ) {
            return i;
          }
        }
      }

      function checkComplete() {
        completedPredictions++;
        if (completedPredictions == numberofPredictions) {
          res.send(200);
        }
      }

      // loop through all results. if the home team of the results & the Predictions match, go into scoring mode
      // if(data.matches[j].winner==prediction.fixtures[i].homeTeam && prediction.fixtures[i].prediction == "HOME")
      // then check away, then check draw, the result of each if is prediction.fixtures[i].result = 1;
      // prediction.fixtures[i].winner = matches[j].winner;
      // prediction.save();
      // updatePoints
    });
  });

  //this route will go and get all users and loop through them. It will then go get all of the predictions for a given user. Do a
  //sum of each prediction.fixtures result property. Once you have a total. user[i].points = total; user[i].save();

  router.get("/updatePoints", function(req, res) {
    let userIds = [];
    let userPoints = {};
    // initialize userIds list and userPoints object
    let users1;
    user
      .find({})
      .exec()
      .then(function(users) {
        // find all the users and push the user._id to the userIds empty []
        // then assign each user._id as the property in userPoints object with 0 points
        // as the value
        users1 = users;
        users.forEach(function(user) {
          userIds.push(user._id);
          userPoints[user._id] = 0; /* {123:0,456:0,789:0} */
        });
        // return all the predictions found with a user._id in the userIds list
        return Predictions.find({ user_id: { $in: userIds } });
      })
      .then(function(predictions) {
        // loop through all predictions
        for (let i = 0; i < predictions.length; i++) {
          // loop through every fixture in each prediction
          for (let j = 0; j < predictions[i].fixtures.length; j++) {
            // aggregating all the points in the result property for each userId
            userPoints[predictions[i].user_id] +=
              predictions[i].fixtures[j].result;
          }
        }
        users1.forEach(function(user) {
          // update the points prop on each user obj then save
          user.points = userPoints[user._id];
          user.save();
        });
        res.send(200);
      });
  });
  // =========================
  // LEADERBOARD PAGE
  // =========================
  // Sort users by their points and send the data to leaderboard ejs page
  router.get("/leaderboard", isLoggedIn, function(req, res) {
    user
      .find({})
      .sort("-points")
      .exec()
      .then(function(users) {
        res.render("game-pages/leaderboard", { data: users }); // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
      });
  });
  // =========================
  // PREDICTIONS PAGE
  // =========================
  // Hit the footy api to get the fixtures for the current matchday and send the
  // data to the predictions ejs page
  router.get("/predictions", isLoggedIn, function(req, res) {
    requestPromise({
      method: "GET",
      uri: "https://api.football-data.org/v2/competitions/PL/matches",
      json: true,
      headers: {
        "X-Auth-Token": configAuth.footballToken
      },
      rejectUnauthorized: false
    })
      .then(data => {
        if (!data) {
          const message = "No Footy Data";
          console.error(message);
          return res.status(404).send(message);
        }
        const matchday = data.matches[0].season.currentMatchday;
        // see if loggedin user already has a predictions
        Predictions.find(
          { matchDay: matchday, user_id: req.user._id },
          function(err, prediction) {
            if (!err) {
              if (prediction.length) {
                res.redirect("/updatePredictions");
              } else {
                let thisWeeksFixtures = [];
                for (let i = 0; i < data.matches.length; i++) {
                  if (data.matches[i].matchday == matchday) {
                    thisWeeksFixtures.push(data.matches[i]);
                  }
                }
                res.render("game-pages/predictions", {
                  data: thisWeeksFixtures
                });
              }
            }
          }
        );
      })
      .catch(err =>
        res.status(500).json({ message: "Cannot display predictions page" })
      );
  });

  // Hit the api for the fixtures then create a prediction for the user
  // and save it to the database
  router.post("/predictions", isLoggedIn, function(req, res) {
    requestPromise({
      method: "GET",
      uri: "https://api.football-data.org/v2/competitions/PL/matches",
      json: true,
      headers: {
        "X-Auth-Token": configAuth.footballToken
      },
      rejectUnauthorized: false
    })
      .then(data => {
        if (data) {
          const matchday = data.matches[0].season.currentMatchday;
          let fixtures = [];
          for (let i = 0; i < 10; i++) {
            fixtures.push({
              home_team: req.body["fixtureHome_" + (i + 1)],
              away_team: req.body["fixtureAway_" + (i + 1)],
              prediction: req.body["fixture_" + (i + 1)],
              result: 0
            });
          }
          Predictions.create(
            {
              user_id: req.user._id,
              matchDay: req.body.matchDay,
              fixtures: fixtures
            },
            function(err, prediction) {
              res.render("game-pages/predictions-posted");
            }
          );
        } else {
          const message = "No Footy Data";
          console.error(message);
          return res.status(404).send(message);
        }
      })
      .catch(err =>
        res.status(500).json({ message: "Cannot display predictions page" })
      );
  });

  // Fetch the fixtures from the api and the prediction values input by the user
  // for them
  router.get("/updatePredictions", isLoggedIn, function(req, res) {
    requestPromise({
      method: "GET",
      uri: "https://api.football-data.org/v2/competitions/PL/matches",
      json: true,
      headers: {
        "X-Auth-Token": configAuth.footballToken
      },
      rejectUnauthorized: false
    })
      .then(data => {
        if (!data) {
          const message = "No Footy Data";
          console.error(message);
          return res.status(404).send(message);
        }
        const matchday = data.matches[0].season.currentMatchday;
        Predictions.find(
          { matchDay: matchday, user_id: req.user._id },
          function(err, prediction) {
            if (!err) {
              if (prediction.length) {
                // render out the users predictions
                res.render("game-pages/update-predictions", {
                  data: data,
                  prediction: prediction[0]
                });
              } else {
                res.redirect("/predictions");
              }
            }
          }
        );
      })
      .catch(err =>
        res.status(500).json({ message: "Cannot display predictions page" })
      );
  });

  // Post the updated fixture predictions
  router.post("/update-predictions", isLoggedIn, function(req, res) {
    requestPromise({
      method: "GET",
      uri: "https://api.football-data.org/v2/competitions/PL/matches",
      json: true,
      headers: {
        "X-Auth-Token": configAuth.footballToken
      },
      rejectUnauthorized: false
    })
      .then(data => {
        if (data) {
          let count = 0;
          let fixtureNum = 0;
          const matchday = data.matches[0].season.currentMatchday;
          console.log("matchday:", matchday);
          Predictions.findOne(
            { user_id: req.user._id, matchDay: matchday },
            function(err, prediction) {
              if (prediction) {
                fixtureNum = prediction.fixtures.length;
                prediction.fixtures.forEach((fixture, i) => {
                  fixture.prediction = req.body["fixture_" + i];
                  checkComplete();
                });
                function checkComplete() {
                  count++;
                  if (count == fixtureNum) {
                    prediction.save();
                    res.render("game-pages/predictions-posted");
                  }
                }
              } else {
                res.redirect("/predictions");
              }
            }
          );
        } else {
          const message = "No Footy Data";
          console.error(message);
          return res.status(404).send(message);
        }
      })
      .catch(err =>
        res.status(500).json({ message: "Cannot display predictions page" })
      );
  });

  // =========================
  // RESULTS PAGE
  // =========================
  // Hit the api for the results of previous weeks fixtures and send the data to
  // the results ejs page
  router.get("/results", function(req, res) {
    requestPromise({
      method: "GET",
      uri: "https://api.football-data.org/v2/competitions/PL/matches",
      json: true,
      headers: {
        "X-Auth-Token": configAuth.footballToken
      },
      rejectUnauthorized: false
    })
      .then(data => {
        if (!data) {
          const message = "No Footy Data";
          console.error(message);
          return res.status(404).send(message);
        }
        const matchday = data.matches[0].season.currentMatchday - 1;
        return requestPromise({
          method: "GET",
          uri: "https://api.football-data.org/v2/competitions/PL/matches",
          qs: {
            matchday: `${matchday}`
          },
          json: true,
          headers: {
            "X-Auth-Token": configAuth.footballToken
          },
          rejectUnauthorized: false
        }).catch(err => res.status(500).json({ message: "Gone Pete Tong" }));
      })
      .then(data => {
        res.render("game-pages/matchday-results.ejs", { data: data });
      });
  });

  router.get("/all-predictions", isLoggedIn, function(req, res) {
    Predictions.find({}, function(err, data) {
      if (!err) {
        res.send(data);
      }
    });
  });
};

function isLoggedIn(req, res, next) {
  // if user is authenticated in session then carry on
  if (req.isAuthenticated()) return next();

  // if not authenticated, redirected to homepage
  res.redirect("/");
}
