const getBabelConfig = require("../getBabelConfig");

module.exports = require("babel-jest").createTransformer(
  getBabelConfig({
    react: process.env.TS_ENGINE_CONFIG_REACT === "true",
  })
);
