const presetEnv =
  process.env.NODE_ENV === "test"
    ? [
        "@babel/env",
        {
          useBuiltIns: "usage",
          corejs: { version: 3 },
        },
      ]
    : ["@babel/env", { modules: false }];

module.exports = {
  presets: ["@babel/typescript", presetEnv],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-proposal-optional-chaining",
  ],
};
