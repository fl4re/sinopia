'use strict';

var Error = require('http-errors');
var jwtDecode = require('jwt-decode');

var google_controller = function (config, auth) {
  var google = require('googleapis');
  var OAuth2 = google.auth.OAuth2;
  var oauth2client = new OAuth2(config.google.client_id, config.google.client_secret, config.url_prefix + "/-/google/callback");
  var scopes = config.google.scope; //["email", "profile"];

  return {
    redirect_to_remote_login: function (req, res, next) {
      res.redirect(oauth2client.generateAuthUrl({access_type: 'offline', scope: scopes, hd: config.google.host_domain}));
    },
    callback: function (req, res, next) {
      var code = req.query.code;
      var error = req.query.error;
      if (error) {return next(Error[409](error));}
      oauth2client.getToken(code, function(err, tokens) {
        if (err) {
          return next(Error[409](err));
        } else {
          var email = jwtDecode(tokens.id_token).email;
          auth.set_session(req, res, email, JSON.stringify(tokens));
        }
      });
    }
  }
};

module.exports = function github_oauth_login(config, auth) {
  var app = require('express').Router();
  var ctl = google_controller(config, auth);

  app.get('/-/google/login', ctl.redirect_to_remote_login);
  app.get('/-/google/callback', ctl.callback);

  return app;
};
