const config = {
  presets: ["@ts-engine/babel-preset"],
};

if (process.env.TS_ENGINE_CONFIG_REACT === "true") {
  config.presets.push("@ts-engine/babel-preset-react");
}

module.exports = config;
