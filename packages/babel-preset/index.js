module.exports = () => {
  return {
    presets: [
      "@babel/typescript",
      [
        "@babel/env",
        {
          modules: process.env.NODE_ENV === "test",
        },
      ],
    ],
    plugins: [
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-object-rest-spread",
      "@babel/plugin-proposal-optional-chaining",
      [
        "@babel/plugin-transform-runtime",
        {
          corejs: false,
          helpers: true,
          regenerator: true,
        },
      ],
    ],
  };
};
