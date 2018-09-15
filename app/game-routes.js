const express         = require('express');
const requestPromise  = require('request-promise');
const mongoose        = require('mongoose');
const parser          = require('body-parser');

const router          = express.Router();

const user            = require('../app/models/user');
const { results }     = require('../app/models/results');
const { Predictions } = require('../app/models/prediction');
const configAuth      = require('../config/auth');


module.exports = function(router) {

    router.get('/checkPredictions', function(req,res) {
        // go out to the API and get the current state of things
        console.log('started checking predictions');
        requestPromise({
            'method'  : 'GET',
            'uri'     : 'https://football-data.org/v2/competitions/PL/matches',
            'json'    : true,
            'headers' : {
                'X-Auth-Token' : configAuth.footballToken
            },
            'rejectUnauthorized' : false
        })
        .then(data => {
            console.log('api request complete');
            if (!data) {
                const message = ('No Footy Data');
                console.error(message);
                return res.status(404).send(message);
            }
            // get the matchDay from the API
            const matchday = data.matches[0].season.currentMatchday;
            let numberofPredictions = 0;
            let completedPredictions = 0;
            // go grab all Predictions for this matchDay
            Predictions.find({ matchDay : matchday }, function(err, predictions) {
                //console.log('predictions calc:', predictions)
                // loop through all predictions
                numberofPredictions = predictions.length;
                console.log('found predictions,',numberofPredictions);
                for (let i = 0; i < predictions.length; i++) {
                    for (let j = 0; j < data.matches.length; j++) {
                        if (data.matches[j].matchDay == matchday) {
                            fixture = search(data.matches[j].homeTeam.name, data.matches[j].awayTeam.name, predictions[i].fixtures);
                            if (data.matches[j].score.winner == predictions[i].fixtures[fixture].prediction) {
                                predictions[i].fixtures[fixture].winner = data.matches[j].score.winner; // HOME_TEAM, AWAY_TEAM, DRAW
                                predictions[i].fixtures[fixture].result = 1;
                                predictions[i].save();
                            }
                        }
                    }
                    checkComplete();
                }
            });

            function search(homeTeam, awayTeam, myArray) {
                for (let i = 0; i < myArray.length; i++) {
                    if (myArray[i].home_team === homeTeam && myArray[i].away_team === awayTeam) {
                        return i;
                    }
                }
            }

            function checkComplete(){
                completedPredictions++;
                if(completedPredictions == numberofPredictions) {
                    res.send(200);
                    //res.redirect('/updatePoints');
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
    // updatePoints
    /*
        this route will go and get all users and loop through them. It will then go get all of the predictions for a given user. Do a sum of each prediction.fixtures result property. Once you have a total. user[i].points = total; user[i].save();

        */
    router.get('/updatePoints', function(req, res) {
        /*for (let i = 0; i < users.length; i++) {
            users[i].find({ user_id : prediction });
            for (let j = 0; j < Predictions.length; j++) {

            }

        }*/
        let userIds = [];
        let userPoints = {};
        // initialize userIds list and userPoints object
        let users1;
        user.find({}).exec()
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
                return Predictions.find({ user_id : { $in  :userIds } });
            })
            .then(function(predictions) {
                // loop through all predictions
                for (let i = 0; i < predictions.length; i++) {
                    // loop through every fixture in each prediction
                    for (let j = 0; j < predictions[i].fixtures.length; j++) {
                        // aggregating all the points in the result property for each userId
                        userPoints[predictions[i].user_id] += predictions[i].fixtures[j].result;
                        console.log(userPoints);
                    }
                }
                users1.forEach(function(user) {
                    // update the points prop on each user obj then save
                    user.points = userPoints[user._id];
                    user.save();
                    console.log('user: '+user._id+' saved');
                });
                console.log('finished');
                res.send(200);
            });




    });
    // =========================
    // LEADERBOARD PAGE
    // =========================
    router.get('/leaderboard', isLoggedIn, function(req, res) {
        user.find({ user_id : req.user._id }).exec().sort({points : 'desc'}).limit(10)
        .then(data => {
            console.log('leaderboard:', data);
            res.render('game-pages/leaderboard', { data : data });
        });
    });
    //     /*
    //         go get all Users, sort them by points (maybe with a limit of X)
    //
    //     */

    // =========================
    // PREDICTIONS PAGE
    // =========================
    router.get('/predictions', isLoggedIn, function(req, res) {
        debugger
        requestPromise({
            'method'  : 'GET',
            'uri'     : 'https://football-data.org/v2/competitions/PL/matches',
            'json'    : true,
            'headers' : {
                'X-Auth-Token' : configAuth.footballToken
            },
            'rejectUnauthorized': false
        })
        .then(data => {
            if (!data) {
                const message = ('No Footy Data');
                console.error(message);
                return res.status(404).send(message);
            }
            console.log(data.competition.name);
            const matchday = data.matches[0].season.currentMatchday;
            let thisWeeksFixtures = [];
            console.log('Weeks Fixtures:', thisWeeksFixtures);
            for (let i = 0; i < data.matches.length; i++) {
                if (data.matches[i].matchday == matchday) {
                    thisWeeksFixtures.push(data.matches[i]);
                }
            }
            res.render('game-pages/predictions', { data : thisWeeksFixtures });
        })
        .catch(err => res.status(500).json({ message: 'Cannot display predictions page' }));
    });
    router.post('/predictions', isLoggedIn, function(req, res) {
        requestPromise({
            'method'  : 'GET',
            'uri'     : 'https://football-data.org/v2/competitions/PL/matches',
            'json'    : true,
            'headers' : {
                'X-Auth-Token' : configAuth.footballToken
            },
            'rejectUnauthorized': false
        })
        .then(data => {
            if (data) {
                console.log(req.body);
                console.log(req.user);
                const matchday = data.matches[0].season.currentMatchday;
                console.log('matchday:', matchday);
                Predictions.find({ user_id : req.user._id, matchDay : matchday }, function(err, prediction) {
                    console.log('posting predictions:', prediction);
                    if (prediction.length) {
                        res.render('game-pages/update-predictions',{ prediction : prediction[0], data : data });
                        // req.flash('You have already made predictions for this weeks fixtures but you can update them here');
                    } else {
                        let fixtures = [];
                        for (let i = 0; i < 10; i++) {
                            fixtures.push({
                                home_team  : req.body["fixtureHome_" + (i + 1)],
                                away_team  : req.body["fixtureAway_" + (i + 1)],
                                prediction : req.body["fixture_" + (i + 1)]
                            });
                        }
                        Predictions.create({
                            user_id: req.user._id,
                            matchDay: req.body.matchDay,
                            fixtures: fixtures
                        },
                        function(err, prediction) {
                            console.log('prediction:', prediction);
                            res.render('game-pages/predictions-posted');
                        });
                    }
                });
            } else {
                const message = ('No Footy Data');
                console.error(message);
                return res.status(404).send(message);
            }
        })
        .catch(err => res.status(500).json({ message: 'Cannot display predictions page' }));
    });

    router.get('/predictions-posted', isLoggedIn, function(req, res) {
        res.render('game-pages/predictions-posted');
    });

    router.put('game-pages/update-predictions/', isLoggedIn, function(req, res) {
        requestPromise({
            'method'  : 'GET',
            'uri'     : 'https://football-data.org/v2/competitions/PL/matches',
            'json'    : true,
            'headers' : {
                'X-Auth-Token' : configAuth.footballToken
            },
            'rejectUnauthorized': false
        })
        .then(data => {
            if (!data) {
                const message = ('No Footy Data');
                console.error(message);
                return res.status(404).send(message);
            }
            const matchday = data.matches[0].season.currentMatchday;
            Predictions.findOneAndUpdate({ user_id : req.user._id, matchDay : matchday },
            function(err, prediction) {
                console.log('update preds:', preds);
                if (prediction.length) {

                    // const thisWeeksFixtures = [];
                    // console.log('empty update list:', thisWeeksFixtures);
                    // for (let i = 0; i < prediction.fixtures.length; i++) {
                    //     thisWeeksFixtures.push(prediction.fixtures[i]);
                    // }
                    // console.log('Updateable fixtures:', thisWeeksFixtures);
                    prediction.save();
                    res.render('game-pages/update-predictions',{ prediction : prediction[0], data : data });
                }
            });
        })
        .catch(err => res.status(500).json({ message: 'Internal server error' }));
    });
    // =========================
    // RESULTS PAGE
    // =========================
    router.get('/results', function(req, res) {
        requestPromise({
            'method'  : 'GET',
            'uri'     : 'https://football-data.org/v2/competitions/PL/matches',
            'json'    : true,
            'headers' : {
                'X-Auth-Token' : configAuth.footballToken
            },
            'rejectUnauthorized': false
        })
        .then(data => {
            if (!data) {
                const message = ('No Footy Data');
                console.error(message);
                return res.status(404).send(message);
            }
            const matchday = data.matches[0].season.currentMatchday - 1;
            console.log('matchday:', matchday);
            return requestPromise({
                'method'  : 'GET',
                'uri'     : 'https://football-data.org/v2/competitions/PL/matches',
                'qs'      : {
                    'matchday' : `${matchday}`
                },
                'json'    : true,
                'headers' : {
                    'X-Auth-Token' : configAuth.footballToken
                },
                'rejectUnauthorized': false
            })
            .catch(err => res.status(500).json({ message : 'Gone Pete Tong' }));
        })
        .then(data => {
            console.log(data);
            res.render('game-pages/matchday-results.ejs', { data : data });
        });
         // loads results.ejs file
    });

    router.get('/all-predictions', isLoggedIn, function(req,res){
        Predictions.find({},function(err,data){
            if(!err){
                res.send(data);
            }
        });
    });

};

function isLoggedIn(req, res, next) {
    // if user is authenticated in session then carry on
    if (req.isAuthenticated())
        return next();

    // if not authenticated, redirected to homepage
    res.redirect('/');
}
