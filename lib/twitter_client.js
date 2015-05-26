require('neon');

var oauth2,
    fs = require('fs'),
    OAuth = require('oauth'),
    OAuth2 = OAuth.OAuth2,
    config = JSON.parse(fs.readFileSync('config/config.json', 'utf-8'));

var Twit = require('twit')

var T = new Twit({
    consumer_key:         config.twitterConsumerKey,
    consumer_secret:      config.twitterConsumerSecret,
    access_token:         config.clientKey,
    access_token_secret:  config.clientSecret
});

/**
 * TwitterClient is a very simple api to a single user, app only twitter account
 *
 * ## Usage:
 *
 *     var TwitterClient = require('lib/twitter_client');
 *
 *  TwitterClient.getMentions('function(mentions){
 *    console.log(mentions) // > [{mention}, {mention}, ...]
 *  });
 *
 *  TwitterClient.post('status update string message');
 *
 * @class TwitterClient
 */

var TwitterClient = Class('TwitterClient')({

  /**
 * Retrives the last 20 mentions
 *
 * @function getMentions
 * @param {function} [callback] - The configuration to extend the instance
 */
  getMentions : function getMentions (cb) {
    T.get('statuses/mentions_timeline', {},function (err, data) {
      if(err){
        throw(err);
      }
      cb(data);
    });
  },

  /**
 * Update the account status timeline
 *
 * @function post
 * @param {string} [message] - The message (140 chars duh!)
 */
  post : function post (post, cb) {
    T.post('statuses/update', { status: post }, function(err, data, response) {
      if(err){
        throw(err);
      }
      cb();
    });
  }

});

module.exports = TwitterClient;