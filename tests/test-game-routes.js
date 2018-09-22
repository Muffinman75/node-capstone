const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const should = chai.should();

const { Predictions } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function seedPredictionData() {
  console.info('seeding prediction data');
  const predictionData = [];

  for ( let i = 1; i <= 10; i++) {
    predictionData.push(generatePredictionData());
  }
  return Prediction.insertMany(seedData);
}

function generatePredictionData() {
    return {
        user_id     : String,
        matchDay    : String, // 1-38
        fixtures    : [ {
            home_team    : String, // Arsenal
            away_team    : String, // Totty
            prediction   : String, // HOME_WIN, AWAY, DRAW
            winner       : String,
            result       : { type : Number, default : 0} // 0 = incorrect, 1 = correct
        } ]
    };
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Predictions API resource', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedPredictionData();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });
