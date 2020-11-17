module.exports = (api) => {
  api.cache(false);

  return {
    presets: [require("@ts-engine/babel-preset")],
  };
};
