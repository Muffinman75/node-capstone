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
            let numberofPredictions = 0;
            let completedPredictions = 0;
            // go grab all Predictions for this matchDay
            Predictions.find({ matchday : matchday },function(err,predictions){
                //console.log('predictions calc:', predictions)
                // loop through all predictions
                numberofPredictions = predictions.length;
                for (let i = 0; i < predictions.length; i++) {
                    for (let j = 0; j < data.matches.length; j++) {
                        if (data.matches[j].matchday == matchday) {
                            fixture = search(data.matches[j].homeTeam.name,data.matches[j].awayTeam.name,predictions[i].fixtures);
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

            function search(homeTeam, awayTeam, myArray){
                for (var i=0; i < myArray.length; i++) {
                    if (myArray[i].home_team === homeTeam && myArray[i].away_team === awayTeam) {
                        return i;
                    }
                }
            }

            function checkComplete(){
                completedPredictions++;
                if(completedPredictions == numberofPredictions){
                    //res.send(200);
                    res.redirect('/updatePoints');
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
        user.find({}).exec()
            .then(function(users){
                users.forEach(function(user){
                    userIds.push(user._id);
                });
                //return Predictions.find({user_id:{$in:userIds}})
            });
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
