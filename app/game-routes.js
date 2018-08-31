const express = require('express');
const router = express.Router();


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
