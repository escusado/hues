'use strict'

require('neon');

/** TYPE DEFINITIONS **/

/**
 * This is the main callback type, and returns an array of
 * match objects.
 * @callback matchCallback
 * @param {?Error} error An error object, may be null if no error occurred.
 * @param {?String[]} matches The resulting matches.
 */

/**
 * The format of a user object for matching.
 * @typedef {object} userObject
 * @property {number} name Username.
 */


/**
 * Matcher is a class that given a pool of people will match them
 * in pairs with a topic at random, given enough members in the
 * user pool.
 *
 * ## Usage:
 *
 *     var Matcher = require('lib/matcher');
 *
 * ### Instantiating
 *
 *     var matcher = new Matcher({
 *       users : [{name: '@pigeonfolk'} ...],
 *       topics : ["What is your favorite pizza topping"...],
 *       minimumSize : 8
 *     });
 *
 * ### Matching
 *
 *     matcher.match(function (err, matchObject) {
 *       if (err) {
 *         console.log('darn!', err);
 *       }
 *
 *       // The users object now only contains the unpaired, if anyone was
 *       // left behind, or if no matches were made.
 *       console.log(matchObject, matcher.users);
 *     });
 *
 * @class Matcher
 */
var Matcher = Class({}, 'Matcher')({
  INVALID_USERS : "The users property is not an array. Please use an array.",
  INVALID_USER : "One or more users in the array is invalid. Please, use objects that have a name property as a string",
  INVALID_TOPICS : "The topics property is not an array. Please use an array.",
  INVALID_TOPIC : "One or more topics in the array is invalid. Please use strings.",

  prototype : {

    /**
     * Array of user objects
     * @memberof Matcher
     * @instance
     * @default []
     * @type {userObject[]}
     */
    users : null,

    /**
     * Array of topic strings
     * @memberof Matcher
     * @instance
     * @default []
     * @type {String[]}
     */
    topics : null,

    /**
     * Minimum number of users before attempting to match
     * @memberof Matcher
     * @instance
     * @default 10
     * @type {Number}
     */
    minimumSize : 10,

    /**
     * Matcher Constructor
     * @constructs
     * @param {object} [config] - The configuration to extend the instance
     */
    init : function init(config) {
      Object.keys(config).forEach(function (property) {
        this[property] = config[property];
      }, this);
    },

    /**
     * Clusters the points and returns an array of `Archipelago.Cluster` objects
     *
     * @function match
     * @memberof Matcher
     * @instance
     * @argument {matchCallback} [callback] function to be called for when
     *                                      matching is complete.
     */
    match : function match(callback) {
      this._validateData(function validateHandler(error) {
        var matches;

        if (error) {
          return callback && callback(error, null);
        }

        matches = [];

        if (this._getPoolSize() < this.minimumSize) {
          return callback && callback(null, matches)
        }

        this._match([], callback);
      }.bind(this));
    },

    /*
     * If there's enough users, matches more
     */
    _match : function _match(matches, callback) {
      var firstLuckyPerson, secondLuckyPerson, topic;

      if (this.users.length >= 2) {
        firstLuckyPerson = this._fetchUser();
        secondLuckyPerson = this._fetchNonDuplicateUser(firstLuckyPerson);

        // not so lucky after all
        if (!secondLuckyPerson) {
          this.users.push(firstLuckyPerson);
          return callback(null, []);
        }

        topic = this._fetchTopic();

        // this operation wears off luck.
        matches.push(this._generateMatch(firstLuckyPerson, secondLuckyPerson, topic));

        return this._match(matches, callback);
      }

      return callback && callback(null, matches);
    },

    /*
     * Generates the match string
     */
    _generateMatch : function _generateMatch(firstPerson, secondPerson, topic) {
      var firstName, secondName;

      firstName = firstPerson.name;
      secondName = secondPerson.name;

      return firstName + ", " + secondName + ", say hi, shake hands! — " + topic;
    },

    /*
     * Fetches a random user and removes it from the array.
     */
    _fetchUser : function _fetchUser() {
      var index, item;

      index = Math.floor(Math.random() * this.users.length);
      item = this.users.splice(index, 1);

      return item[0];
    },

    /*
     * Given a user object, attempts a fetch until it finds a unique one,
     * unless it runs out.
     */
    _fetchNonDuplicateUser : function _fetchNonDuplicateUser(user) {
      var userCandidate, rejected;

      rejected = [];

      userCandidate = this._fetchUser();
      while (userCandidate && userCandidate.name === user.name) {
        rejected.push(userCandidate);
        userCandidate = this._fetchUser();
      }

      // put em back
      this.users = this.users.concat(rejected);

      return userCandidate;
    },

    /*
     * Fetches a random topic
     */
    _fetchTopic : function _fetchTopic() {
      var index;

      index = Math.floor(Math.random() * this.topics.length);

      return this.topics[index];
    },

    /*
     * Checks the consistency of this.users and this.topics.
     * calls back with errors if any, calls back with null otherwise;
     */
    _validateData : function (callback) {
      var error, hasInvalidUsers, hasInvalidTopics;

      if (!(this.users instanceof Array)) {
        error = new Error(this.constructor.INVALID_USERS);
        return callback(error);
      }

      if (!(this.topics instanceof Array)) {
        error = new Error(this.constructor.INVALID_TOPICS);
        return callback(error);
      }

      hasInvalidUsers = this.users.some(this._validateUser)
      hasInvalidTopics = this.topics.some(this._validateTopic)

      if (hasInvalidUsers) {
        error = new Error(this.constructor.INVALID_USER);
        return callback(error);
      }

      if (hasInvalidTopics) {
        error = new Error(this.constructor.INVALID_TOPIC);
        return callback(error);
      }

      callback(null);
    },

    /*
     * Validates the structure of a user object.
     */
    _validateUser : function _validateUser(user) {
      return !(typeof user === 'object' && typeof user.name === 'string');
    },

    /*
     * Validates the structure of a topic object.
     */
    _validateTopic : function _validateTopic(topic) {
      return !(typeof topic === 'string');
    },

    /*
     * Gets the size of unique names in the users array.
     */
    _getPoolSize : function _getPoolSize() {
      var uniqueUsers;

      uniqueUsers = this.users.filter(function uniqueFilter(user, index, users) {
        return users.indexOf(user) === index;
      });

      return uniqueUsers.length;
    }
  }
});

module.exports = Matcher;
