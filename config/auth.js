// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '474972389645148', // your App ID
        'clientSecret'  : '60cf47519ec8419f08be00399a250010', // your App Secret
        'callbackURL'   : 'https://salty-basin-64289.herokuapp.com/auth/facebook/callback',
        'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields' : ['id', 'email', 'name'], // For requesting permissions from Facebook API
        'enableProoof'  : true
    },

    'twitterAuth' : {
        'consumerKey'       : 'asoferHkRjvSmH3vltAxjn6IN',
        'consumerSecret'    : 'VyWemgMRIAzqXSnFxSKhZmXmjKZvaBJHNmFmWByJC6Lj4wr76T',
        'callbackURL'       : 'https://salty-basin-64289.herokuapp.com/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '867787338338-rav4adiqf9g1d5gg7ui7bbuslt5unkjk.apps.googleusercontent.com',
        'clientSecret'  : 'kQiLXprtrP3u4b8lRy1QlN26',
        'callbackURL'   : 'https://salty-basin-64289.herokuapp.com/auth/google/callback'
    },

    'footballToken' : '93de12ac2f5c4067836a021bc4875a7c'

};
