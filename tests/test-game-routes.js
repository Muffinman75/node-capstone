'use strict';

const chai = require('chai');
const chaihttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

const expect = chai.expect;

chai.use(chaihttp);

describe('Predictions', function() {
    before(function() {
        return runServer();
    });
    after(function() {
        return closeServer();
    });
    it('should list the ten matchday fixtures selection on GET', function() {
        return chai.request(app)
        .get('/predictions')
        .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            // expect(res).to.be.a('array');
            expect(res.body.length).to.be.above(0);
            res.body.forEach(function(blog) {
                expect(predictions[0].fixtures).to.be.a('array');
                expect(predictions[0].fixtures).to.have..items('title', 'content', 'author', 'id', 'publishDate');
            });
        });
    });
