module.exports = () => {
  const presetEnvOptions =
    process.env.NODE_ENV === "test"
      ? {
          useBuiltIns: "usage",
          corejs: { version: 3 },
        }
      : { modules: false };

  return {
    presets: ["@babel/typescript", ["@babel/env", presetEnvOptions]],
    plugins: [
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-object-rest-spread",
      "@babel/plugin-proposal-optional-chaining",
    ],
  };
};
