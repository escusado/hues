'use strict'

var expect = require('expect');

var Matcher = require('../lib/matcher');

var Support = {
  users : {
    low : [{name: '@fortunabot'}],
    high : [{name: '@pigeonfolk'}, {name: '@escusado'}, {name: '@fortunabot'}],
    duplicate : [{name: '@fortunabot'}, {name: '@fortunabot'}, {name: '@fortunabot'}],
    wrongType : {},
    invalid : ['heh']
  },
  topics : {
    ok : ['what is the most important thing to bring people together?'],
    wrongType : {},
    invalid : [1]
  },
  minimumSize : {
    high : 3,
    low : 2
  }
};

describe('Matcher', function () {
  describe('::match', function () {

    it('should not match if size of user pool under minimumSize', function (done) {
      var matcher = new Matcher({
        users : Support.users.low.slice(),
        topics : Support.topics.ok.slice(),
        minimumSize : Support.minimumSize.high
      });

      matcher.match(function (error, matches) {
        expect(matches.length).toBe(0);
        expect(matcher.users.length).toBe(Support.users.low.length);
        done();
      });
    });

    it('should not count duplicates for user pool size', function (done) {
      var matcher = new Matcher({
        users : Support.users.duplicate.slice(),
        topics : Support.topics.ok.slice(),
        minimumSize : Support.minimumSize.high
      });

      matcher.match(function (error, matches) {
        expect(matches.length).toBe(0);
        expect(matcher.users.length).toBe(Support.users.duplicate.length);
        done();
      });
    });

    it('should not match two users if their name is the same', function (done) {
      var matcher = new Matcher({
        users : Support.users.duplicate.slice(),
        topics : Support.topics.ok.slice(),
        minimumSize : Support.minimumSize.low
      });

      matcher.match(function (error, matches) {
        expect(matches.length).toBe(0);
        expect(matcher.users.length).toBe(Support.users.duplicate.length);
        done();
      });
    });

    it('should remove matched users from the users object', function (done) {
      var matcher = new Matcher({
        users : Support.users.high.slice(),
        topics : Support.topics.ok.slice(),
        minimumSize : Support.minimumSize.low
      });

      matcher.match(function (error, matches) {
        expect(matcher.users.length).toBe(1);
        done();
      });
    });

    it('should not send an error if data is correct', function (done) {
      var matcher = new Matcher({
        users : Support.users.high.slice(),
        topics : Support.topics.ok.slice(),
        minimumSize : Support.minimumSize.low
      });

      matcher.match(function (error, matches) {
        expect(error).toBe(null);
        done();
      });
    });

    it('should match users', function (done) {
      var matcher = new Matcher({
        users : Support.users.high.slice(),
        topics : Support.topics.ok.slice(),
        minimumSize : Support.minimumSize.low
      });

      matcher.match(function (error, matches) {
        var matchRe, users;

        users = Support.users.high.map(function (user) {
          return user.name;
        });

        users = users.join("|");
        matchRe = new RegExp(users)

        expect(matchRe.test(matches[0])).toBe(true);

        done();
      });
    });

    describe('Data validation', function () {
      it('it should call error if users is not an array', function (done) {
        var matcher = new Matcher({
          users : Support.users.wrongType,
          topics : Support.topics.ok.slice(),
          minimumSize : Support.minimumSize.low
        });

        matcher.match(function (error, matches) {
          expect(error).toNotBe(null);
          done();
        });
      });
      it('it should call error if a user is invalid', function (done) {
        var matcher = new Matcher({
          users : Support.users.invalid.slice(),
          topics : Support.topics.ok.slice(),
          minimumSize : Support.minimumSize.low
        });

        matcher.match(function (error, matches) {
          expect(error).toNotBe(null);
          done();
        });
      });
      it('it should call error if topics is not an array', function (done) {
        var matcher = new Matcher({
          users : Support.users.high.slice(),
          topics : Support.topics.wrongType,
          minimumSize : Support.minimumSize.low
        });

        matcher.match(function (error, matches) {
          expect(error).toNotBe(null);
          done();
        });
      });
      it('it should call error if a topic is invalid', function (done) {
        var matcher = new Matcher({
          users : Support.users.high.slice(),
          topics : Support.topics.invalid,
          minimumSize : Support.minimumSize.low
        });

        matcher.match(function (error, matches) {
          expect(error).toNotBe(null);
          done();
        });
      });
    });
  });
});
