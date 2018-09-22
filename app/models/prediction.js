'use strict';

const mongoose = require('mongoose');


// same schema for the results model
const predictionSchema = mongoose.Schema({

        user_id     : String,
        matchDay    : String, // 1-38
        fixtures    : [ {
            home_team    : String, // Arsenal
            away_team    : String, // Totty
            prediction   : String, // HOME_WIN, AWAY, DRAW
            winner       : { type : String, default : ""},
            result       : { type : Number, default : 0} // 0 = incorrect, 1 = correct
        } ]

});

const Predictions = mongoose.model('Predictions', predictionSchema);

module.exports = { Predictions };
