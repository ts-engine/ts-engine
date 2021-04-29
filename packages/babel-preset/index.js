var packageJsonFinder = require("find-package-json");

const packageJson = packageJsonFinder(process.cwd()).next().value;
const hasReact =
  (packageJson.dependencies && packageJson.dependencies.react) ||
  (packageJson.devDependencies && packageJson.devDependencies.react) ||
  (packageJson.peerDependencies && packageJson.peerDependencies.react);

const getEnvOptions = () => {
  if (process.env.NODE_ENV === "test" || process.env.BABEL_ENV === "test") {
    return { useBuiltIns: "usage", corejs: { version: 3 } };
  }

  return { modules: false };
};

// We require() plugins and presets here as letting babel resolve them
// instead of nodejs led to issues when plugins and presets clashed with
// other packages dependencies, for instance using nextjs in the same
// mono repo as ts-engine lead to @babel/plugin-proposal-decorators
// installing into the incorrect directories in node_modules.
module.exports = () => {
  return {
    presets: [
      ...(hasReact
        ? [[require("@babel/preset-react"), { runtime: "automatic" }]]
        : []),
      require("@babel/preset-typescript"),
      [require("@babel/preset-env"), getEnvOptions()],
    ],
    plugins: [
      [require("@babel/plugin-proposal-decorators"), { legacy: true }],
      require("@babel/plugin-transform-typescript"),
      require("@babel/plugin-proposal-class-properties"),
      require("@babel/plugin-proposal-object-rest-spread"),
      require("@babel/plugin-proposal-optional-chaining"),
      require("@babel/plugin-proposal-nullish-coalescing-operator"),
      [
        require("@babel/plugin-transform-runtime"),
        { regenerator: true, corejs: 3, proposals: true },
      ],
    ],
  };
};
