'use strict';

var jwtDecode = require('jwt-decode');

module.exports = GoogleAuth;

function GoogleAuth(config, stuff) {
  var self = Object.create(GoogleAuth.prototype);
  self.google_config = stuff.config.google;
  return self;
}

GoogleAuth.prototype.authenticate = function (user, password, done) {
  var self = this;
  var email, host_domain;

  try {
    var tokens = JSON.parse(password);
    var id_token = jwtDecode(tokens.id_token);
    email = id_token.email;
    host_domain = id_token.hd;
  } catch(err) {
    return done(null, false);
  }

  if (host_domain === self.google_config.host_domain) {
    var groups = [email, host_domain];
    done(false, groups);
  } else {
    done(null, false);
  }
};

GoogleAuth.prototype.adduser = function (user, password, done) {
  done(null, user);
};
