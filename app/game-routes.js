const express        = require('express');
const requestPromise = require('request-promise');
const mongoose       = require('mongoose');
const cron           = require('node-cron');
const parser         = require('body-parser');

const router         = express.Router();

const user           = require('../app/models/user');
const { Prediction } = require('../app/models/game');
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
            requestPromise({
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
            .then(data => {
                for (let i = 0; i < prediction.length; i++) {
                    if (data.matches[i].score.winner === prediction.fixture_1) {
                        user.local.points++;
                    }
                }
            })
            .catch(err => res.status(500).json({ message : 'Gone Pete Tong' }));
        });
        console.log(matchday);
        res.render('game-pages/leaderboard.ejs'); // loads leaderboard.ejs file
    });
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
        Prediction.create(req.body);
        res.render('game-pages/predictions-posted.ejs');
    });
    router.put('/predictions', function(req, res) {
        res.render('game-pages/update-predictions');
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
