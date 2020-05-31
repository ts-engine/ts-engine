const getEnvOptions = () => {
  if (process.env.NODE_ENV === "test" || process.env.BABEL_ENV === "test") {
    return { useBuiltIns: "usage", corejs: { version: 3 } };
  }

  return { modules: false };
};

module.exports = () => {
  return {
    presets: ["@babel/typescript", ["@babel/env", getEnvOptions()]],
    plugins: [
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-object-rest-spread",
      "@babel/plugin-proposal-optional-chaining",
      "@babel/plugin-proposal-nullish-coalescing-operator",
      ["@babel/plugin-transform-runtime", { regenerator: true }],
    ],
  };
};
