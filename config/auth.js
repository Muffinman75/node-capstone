// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '474972389645148', // your App ID
        'clientSecret'  : '60cf47519ec8419f08be00399a250010', // your App Secret
        'callbackURL'   : 'https://salty-basin-64289.herokuapp.com/auth/facebook/callback',
        'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields' : ['id', 'email', 'name'] // For requesting permissions from Facebook API
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'https://salty-basin-64289.herokuapp.com/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'https://salty-basin-64289.herokuapp.com/auth/google/callback'
    }

};
