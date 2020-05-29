import path from "path";
import fs from "fs-extra";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import { preserveShebangs } from "rollup-plugin-preserve-shebangs";
import builtInModules from "builtin-modules";
import {
  entryFilepath,
  extensionsWithDots,
  cjsOutputFilepath,
  esmOutputFilepath,
  outputFilepath,
} from "./constants";
import { getPackage } from "./get-package";

interface CreateBabelConfigOptions {
  react: boolean;
}

export const createBabelConfig = (options: CreateBabelConfigOptions) => {
  const babelConfigFilename = path.resolve(process.cwd(), "babel.config.js");
  const babelConfigExists = fs.existsSync(babelConfigFilename);

  if (babelConfigExists) {
    return {
      configFile: babelConfigFilename,
    };
  }

  const config = {
    configFile: false,
    presets: ["@ts-engine/babel-preset"],
  };

  if (options.react) {
    config.presets = ["@ts-engine/babel-preset-react", ...config.presets];
  }

  return config;
};

interface CreateJestConfigOptions {
  react: boolean;
}

export const createJestConfig = (options: CreateJestConfigOptions) => {
  const jestConfigFilename = path.resolve(process.cwd(), "jest.config.js");
  const jestConfigExists = fs.existsSync(jestConfigFilename);

  const jestConfig = jestConfigExists ? require(jestConfigFilename) : {};

  return {
    testRegex: "src/.*.test.(js|jsx|ts|tsx)$",
    testURL: "http://localhost",
    transform: {
      ".(js|jsx|ts|tsx)$": [
        "babel-jest",
        createBabelConfig({ react: options.react }),
      ],
    },
    ...jestConfig,
  };
};

interface CreateRollupConfigOptions {
  buildType: "library" | "node-app";
  bundleDependencies: boolean;
  minify: boolean;
  react: boolean;
}

export const createRollupConfig = (options: CreateRollupConfigOptions) => {
  const libraryOutput = [
    {
      file: cjsOutputFilepath,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: esmOutputFilepath,
      format: "es",
      sourcemap: true,
    },
  ];

  const nodeAppOutput = [
    {
      file: outputFilepath,
      format: "cjs",
      sourcemap: true,
    },
  ];

  const config = {
    input: entryFilepath,
    output: options.buildType === "library" ? libraryOutput : nodeAppOutput,
    plugins: [
      preserveShebangs(),
      json(),
      commonjs(),
      resolve({
        extensions: extensionsWithDots,
        preferBuiltins: true,
      }),
      babel({
        exclude: "node_modules/**",
        extensions: extensionsWithDots,
        runtimeHelpers: true,
        ...createBabelConfig({ react: options.react }),
      }),
    ],
    external: [...builtInModules],
  };

  if (options.minify) {
    config.plugins.push(terser());
  }

  if (!options.bundleDependencies) {
    const pkg = getPackage();
    config.external.push(
      ...Object.keys(pkg.json?.dependencies ?? {}),
      ...Object.keys(pkg.json?.peerDependencies ?? {})
    );
  }

  return config;
};
