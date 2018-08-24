'use strict';
var memory_cache = function (options) {
  var ttl = options.ttl || 1000; // 1s
  var store = {};
  var dates = {};
  return {
    set: function (key, val) {
      store[key] = val;
      dates[key] = new Date();
    },
    get: function (key) {
      var live = new Date() - dates[key];
      if (live < ttl) {
        return store[key];
      }
    }
  }
};

var cache = memory_cache({ttl: 36000000}); // 10 hours

module.exports = githubAuth;

function githubAuth(config, stuff) {
  var self = Object.create(githubAuth.prototype);
  self.github = require('../github_wrapper')(stuff.config.github);
  return self;
}

githubAuth.prototype.authenticate = function (user, token, done) {
  var self = this;
  var cached_teams = cache.get(token);
  if (!cached_teams) {
    self.github.get_authorized_user(token).then(function (github_user) {
      var teams = github_user.teams.map(function (team) {return team.slug;});
      cache.set(token, teams);
      done(false, teams);
    }, function (reason) {
      done(null, false);
    });
  } else {
    done(false, cached_teams);
  }
};

githubAuth.prototype.adduser = function (user, password, extra, done) {
  done(null, user);
};
