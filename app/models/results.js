'use strict';

const mongoose = require('mongoose');

const resultSchema = ({

    fixture_1    : Number,
    fixture_2    : Number,
    fixture_3    : Number,
    fixture_4    : Number,
    fixture_5    : Number,
    fixture_6    : Number,
    fixture_7    : Number,
    fixture_8    : Number,
    fixture_9    : Number,
    fixture_10   : Number

});

const results = mongoose.model('results', resultSchema);

module.exports = { results };
