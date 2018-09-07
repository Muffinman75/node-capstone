'use strict';

const mongoose = require('mongoose');
;


// same schema for the results model
const predictionSchema = mongoose.Schema({

         fixture_1      : String,
         fixture_2      : String,
         fixture_3      : String,
         fixture_4      : String,
         fixture_5      : String,
         fixture_6      : String,
         fixture_7      : String,
         fixture_8      : String,
         fixture_9      : String,
         fixture_10     : String

});

const Prediction = mongoose.model('Prediction', predictionSchema);

module.exports = { Prediction };
