const express = require('express');
const requestPromise = require('request-promise');

const router = express.Router();

// const configAuth        = require('..config/auth');

requestPromise({
    'method'  : 'GET',
    'uri'     : 'https://football-data.org/v2/competitions/PL/matches',
    'json'    : true,
    'headers' : {
        'X-Auth-Token' : '93de12ac2f5c4067836a021bc4875a7c'
    },
    'rejectUnauthorized': false
})
.then(console.log, console.log);


module.exports = function(router) {

    // =========================
    // LEADERBOARD PAGE (with login links)
    // =========================
    router.get('/leaderboard', function(req, res) {
        res.render('game-pages/leaderboard.ejs'); // loads leaderboard.ejs file
    });
    // =========================
    // PREDICTIONS PAGE (with login links)
    // =========================
    router.get('/predictions', function(req, res) {
        res.render('game-pages/predictions.ejs'); // loads predictions.ejs file
    });
    // =========================
    // RESULTS PAGE (with login links)
    // =========================
    router.get('/results', function(req, res) {
        res.render('game-pages/matchday-results.ejs'); // loads results.ejs file
    });

}
