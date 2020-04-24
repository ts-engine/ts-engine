const path = require("path");
const fs = require("fs-extra");

// Try to use consumer babel.config.js first, then default to internal one
const consumerBabelConfigFilename = path.join(process.cwd(), "babel.config.js");
const consumerBabelConfigExists = fs.existsSync(consumerBabelConfigFilename);

module.exports = require("babel-jest").createTransformer(
  require(consumerBabelConfigExists
    ? consumerBabelConfigFilename
    : "./babel.config.js")
);
