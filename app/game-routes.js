const express         = require('express');
const requestPromise  = require('request-promise');
const mongoose        = require('mongoose');
const parser          = require('body-parser');

const router          = express.Router();

const user            = require('../app/models/user');
const { Results }     = require('../app/models/results');
const { Predictions } = require('../app/models/prediction');
const configAuth      = require('../config/auth');


module.exports = function(router) {

    router.get('/checkPredictions', function(req,res) {
        // go out to the API and get the current state of things
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
            // get the matchDay from the API
            const matchday = data.matches[0].season.currentMatchday;
            // go grab all Predictions for this matchDay
            Predictions.find({ matchday : matchday })
            console.log('predictions calc:', predictions)
            // loop through all predictions
            for (let i = 0; i < Predictions.length; i++) {
                for (let j = 0; j < results.length; j++) {
                    if (data.matches[j].score.winner == Predictions.fixtures[i].homeTeam && Predictions.fixtures[i].prediction == 'HOME_TEAM') {
                        Predictions.fixtures[i].winner = matches[j].winner;
                        user.points++;
                        Predictions.fixtures[i].result = 1;
                        Predictions.save();
                    }
                    if (data.matches[j].score.winner && Predictions.fixtures[i].prediction == 'DRAW') {
                        Predictions.fixtures[i].winner = matches[j].winner;
                        user.points++;
                        Predictions.fixtures[i].result = 1;
                        Predictions.save();
                    }
                    if (data.matches[j].score.winner && Predictions.fixtures[i].awayTeam && Predictions.fixtures[i].prediction == 'AWAY_TEAM') {
                        Predictions.fixtures[i].winner = matches[j].winner;
                        user.points++;
                        Predictions.fixtures[i].result = 1;
                        Predictions.save();
                    }
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
        for (let i = 0; i < users.length; i++) {
            users[i].find({ user_id : prediction });
            for (let j = 0; j < Predictions.length; j++) {

            }

        }
    });
    // =========================
    // LEADERBOARD PAGE
    // =========================
    router.get('/leaderboard', function(req, res) {
        user.find({}).sort({points : 'desc'})
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
    router.get('/predictions', function(req, res) {
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
            res.render('game-pages/predictions.ejs', { data : data });
        });
        console.log('predictions');
    });
    router.post('/predictions', function(req, res) {
        console.log(req.body);
        for (let i = 0; i < 10; i++) {
            Predictions.create({
                prediction : req.body.fixture_[i + 1]
            });
        }
        console.log('Predictions:', Prediction);
        res.render('game-pages/predictions-posted.ejs');
    });
    router.put('/predictions', function(req, res) {
        res.render('game-pages/update-predictions.ejs');
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


}
