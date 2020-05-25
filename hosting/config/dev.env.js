"use strict";
const merge = require("webpack-merge");
const prodEnv = require("./prod.env");

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_BASEURL: '"https://asia-northeast1-mo-kai.cloudfunctions.net/app/api"'
});
