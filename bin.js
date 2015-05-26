require('neon');

// var Hue = require('philips-hue');
// var hue = new Hue();


// // hue.getBridges(function(err, bridges){
// //   if(err) return console.error(err);
// //   console.log(bridges);

// //   var bridge = bridges[0]; // use 1st bridge

// //   hue.auth(bridge, function(err, username){
// //     if(err) return console.error(err);
// //     // console.log("bridge: "+bridge);
// //     // console.log("username: "+username);

// hue.bridge = "192.168.100.11";  // from hue.getBridges()
// hue.username = "newdeveloper"; // from hue.auth()

// var state = {bri: 255, sat: 255, hue: 10000, effect:'none'};

// hue.light(1).setState(state);

//     // hue.light(1).setState({effect: "colorloop"});

//     // hue.light(1).setState({alert: "lselect"});
//     console.log('>>>>');
// //   });
// // });




// Class('Hues')({
//   start : function start () {
//     console.log('>>> started');
//   }
// });

// Hues.start();







#!/usr/bin/env node

require('neon');

var ref, appData,
    fs = require('fs'),
    Firebase = require('firebase'),

    configData = JSON.parse(fs.readFileSync('config/config.json', 'utf-8')),

    TwitterClient = require('../lib/twitter_client'),
    Matcher = require('../lib/matcher');

var BOT_COMMAND = 'room';

/**
 * Fortunabot a bot that matches people with stuff and tweets that!
 *
 *  #Usage
 *  Fortunabot.tweetMatches(configData);
 *
 */
Class('Hues')({

  /**
   * Kickstarts the matching process using the `Matcher` and tweet the results
   * using the TwitterClient
   *
   * @function tweetMatches
   * @memberof Fortunabot
   * @argument {object} [config] config object
   *
   */
  tweetMatches : function tweetMatches (config){

    //connect to firebase
    ref = new Firebase(config.firebaseUrl);

    //get data
    ref.once("value", function (snapshot) {
      //save into global variable
      appData = snapshot.val();

      //init in case on new db
      appData.mentions = appData.mentions || [];
      appData.unmatchedUsers = appData.unmatchedUsers || [];
      appData.topics = appData.topics || ['vampires', 'light'];

      //kickstart the process
      this._process();

    }.bind(this), function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

  },

  /**
   * Verify for valid mentions and users, save already processed mentions and
   * keep only current unmatched users (allow multiple matches)
   *
   * @function _process
   * @memberof Fortunabot
   *
   */
  _process : function _process(){
    //get mentions from timeline
    TwitterClient.getMentions(function(mentions){

      //filter just NEW mentions
      mentions = mentions.filter(function (mention) {
        return appData.mentions.indexOf(mention.id) < 0;
      });

      //iterate over them
      mentions.forEach(function mentionInterator (mention, index) {
        var noCommandPresent = true, alreadyUnmatchedUser;

        //filter mentions only with the desired command
        if (mention.entities.hashtags.length) {
          mention.entities.hashtags.forEach(function(hashtag){
            if(hashtag.text === BOT_COMMAND){
              noCommandPresent = false;
            }
          })
        }

        //no command? skip mention
        if(noCommandPresent){
          return;
        }

        //save valid mention
        appData.mentions.push(mention.id);

        //filter only unmatched users
        alreadyUnmatchedUser = appData.unmatchedUsers.some(function(user){
          user.name === mention.user.screen_name;
        });

        //already on the list? skip user
        if(alreadyUnmatchedUser){
          return;
        }

        //add user to unmatched list
        appData.unmatchedUsers.push({
          name: '@'+mention.user.screen_name}
        );

      }.bind(this));

      //well run it
      this._runMatcher();

    }.bind(this));
  },

  /**
   * Calls the Matcher lib
   *
   * @function _runMatcher
   * @memberof Fortunabot
   *
   */
  _runMatcher : function _runMatcher () {

    var tweets,
        matcher = new Matcher({
          users : appData.unmatchedUsers,
          topics : appData.topics,
          minimumSize : 2
        });

    //called'it
    matcher.match(function (err, matchArray) {
      if (err) {
        console.log('darn!', err);
      }

      //keep reference in caller variable
      tweets = matchArray;

      //saeve unmatched users
      if (matcher.users.length) {
        appData.unmatchedUsers = matcher.users;
      }
    });

    //recursive tweeting
    var doTweet = function doTweet(tweet){
      TwitterClient.post(tweet, function(){
        //check if any tweets letf
        if(tweets.length){
          doTweet(tweets.pop());
        }else{
          //finished? well, save the data
          ref.set(appData, function(){
            // success? exit!
            process.exit(0);
          });
        }
      }.bind(this));
    }.bind(this);

    //only if matches happened
    if(tweets.length){
      doTweet(tweets.pop());
    }else{
      console.log('> sorry no tweets');
      process.exit(0);
    }

  }

});

Fortunabot.tweetMatches(configData);

