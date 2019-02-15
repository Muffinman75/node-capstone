"use strict";
// load the things we need
const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");

const Prediction = require("./prediction");
// define the schema for our user model
const userSchema = mongoose.Schema({
  points: Number,
  local: {
    userName: String,
    password: String
  },
  facebook: {
    id: String,
    token: String,
    name: String,
    email: String
  },
  twitter: {
    id: String,
    token: String,
    displayName: String,
    userName: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String
  }
});

// methods ====================================
// generating a hash for the password
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our application
module.exports = mongoose.model("user", userSchema);
