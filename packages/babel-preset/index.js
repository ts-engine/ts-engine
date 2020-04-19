const getEnvOptions = () => {
  switch (process.env.TS_ENGINE_COMMAND) {
    case "test": {
      return { useBuiltIns: "usage", corejs: { version: 3 } };
      break;
    }
    case "build": {
      return { modules: false };
      break;
    }
    default: {
      return {};
    }
  }
};

module.exports = () => {
  return {
    presets: ["@babel/typescript", ["@babel/env", getEnvOptions()]],
    plugins: [
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-object-rest-spread",
      "@babel/plugin-proposal-optional-chaining",
      ["@babel/plugin-transform-runtime", { regenerator: true }],
    ],
  };
};
