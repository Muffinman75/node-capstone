const express        = require('express');
const requestPromise = require('request-promise');
const mongoose       = require('mongoose');
const cron           = require('node-cron');
const parser         = require('body-parser');

const router         = express.Router();


const { Prediction }    = require('../app/models/game');
const configAuth     = require('../config/auth');


// requestPromise({
//     'method'  : 'GET',
//     'uri'     : 'https://football-data.org/v2/competitions/PL/matches',
//     'qs'      : {
//         'matchday' : `${matchday}`
//     },
//     'json'    : true,
//     'headers' : {
//         'X-Auth-Token' : configAuth.footballToken
//     },
//     'rejectUnauthorized': false
// })
// .then(console.log);


module.exports = function(router, passport) {

    // =========================
    // LEADERBOARD PAGE
    // =========================
    router.get('/leaderboard', function(req, res) {
        cron.schedule('* * 0 * 4', function() {
            const data = requestPromise({
                'method'  : 'GET',
                'uri'     : 'https://football-data.org/v2/competitions/PL/matches',
                'json'    : true,
                'headers' : {
                    'X-Auth-Token' : configAuth.footballToken
                },
                'rejectUnauthorized': false
            })
            .then(console.log(data));
            const matchday = data.matches.season.currentMatchday - 1;
            console.log(matchday);
            const matchData = requestPromise({
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
            });
            if ()
        });
        res.render('game-pages/leaderboard.ejs'); // loads leaderboard.ejs file
    });
    // =========================
    // PREDICTIONS PAGE
    // =========================
    router.get('/predictions', function(req, res) {
        res.render('game-pages/predictions.ejs');
        console.log('predictions');
    });
    router.post('/predictions', function(req, res) {
        console.log(req.body);
        Prediction.create(req.body);
        res.render('game-pages/predictions-posted.ejs');
    });
    router.put('/predictions', function(req, res) {

    });
    // =========================
    // RESULTS PAGE
    // =========================
    router.get('/results', function(req, res) {
        const data = requestPromise({
            'method'  : 'GET',
            'uri'     : 'https://football-data.org/v2/competitions/PL/matches',
            'json'    : true,
            'headers' : {
                'X-Auth-Token' : configAuth.footballToken
            },
            'rejectUnauthorized': false
        })
        .then(console.log(data));
        const matchday = data.matches.season.currentMatchday - 1;
        console.log(matchday);
        const matchData = requestPromise({
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
        });
        res.render('game-pages/matchday-results.ejs'); // loads results.ejs file
    });
}
