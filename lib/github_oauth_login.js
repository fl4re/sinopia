'use strict';

var Error = require('http-errors');

var github_controller = function (config, auth) {
  var github = require('./github_wrapper')(config.github);

  function base_url(req){
    var base = config.url_prefix ? config.url_prefix.replace(/\/$/, '')
      : req.protocol + '://' + req.get('host')
    return base;
  }

  function session_login(res, login, password) {
    var str = login + ':' + password;
    res.cookies.set('token', auth.aes_encrypt(str).toString('base64'))
  }

  var callback_action = function (req, res, next) {
    var code = req.query.code;
    var error = req.query.error;
    if (error) {return next(Error[409](error));}

    github.access_token(code).then(function (access_token) {
      return github.get_authorized_user(access_token).then(function (github_user) {
        session_login(res, github_user.login, access_token);
        res.redirect(base_url(req));
      });
    }).catch(function (reason) {
      return next(Error[409](reason));
    });
  };

  return {
    redirect_to_remote_login: function (req, res, next) {
      res.redirect(github.login_url());
    },
    callback: callback_action
  }
};

module.exports = function github_oauth_login(config, auth) {
  var app = require('express').Router();
  var ctl = github_controller(config, auth);

  app.get('/-/github/login', ctl.redirect_to_remote_login);
  app.get('/-/github/callback', ctl.callback);

  return app;
};
