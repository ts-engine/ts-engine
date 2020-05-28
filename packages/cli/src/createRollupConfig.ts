import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import { preserveShebangs } from "rollup-plugin-preserve-shebangs";
import builtInModules from "builtin-modules";
import { getTsEngineConfig } from "./getTsEngineConfig";
import { getBabelConfig } from "./getBabelConfig";
import { getConsumerPackage } from "./utils/package";
import type { RollupConfig, OutputType } from "./types";

interface CreateRollupConfigOptions {
  outputType: OutputType;
  bundleDependencies: boolean;
  minify: boolean;
  react: boolean;
}

export const createRollupConfig = (
  options: CreateRollupConfigOptions
): RollupConfig => {
  const tsEngineConfig = getTsEngineConfig();
  const extensions = tsEngineConfig.extensions.map((x) => `.${x}`);
  const libraryOutput = [
    {
      file: tsEngineConfig.outputLibraryCjsFilename,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: tsEngineConfig.outputLibraryEsmFilename,
      format: "es",
      sourcemap: true,
    },
  ];
  const nodeAppOutput = [
    {
      file: tsEngineConfig.outputNodeAppFilename,
      format: "cjs",
      sourcemap: true,
    },
  ];

  const config = {
    input: tsEngineConfig.entryFilename,
    output: options.outputType === "library" ? libraryOutput : nodeAppOutput,
    plugins: [
      preserveShebangs(),
      json(),
      commonjs(),
      resolve({
        extensions,
        preferBuiltins: true,
      }),
      babel({
        exclude: "node_modules/**",
        extensions,
        runtimeHelpers: true,
        ...getBabelConfig({ react: options.react }),
      }),
    ],
    external: [
      // don't try and bundle in native built in node modules like 'path' and 'fs'
      ...builtInModules,
    ],
  };

  if (options.minify) {
    config.plugins.push(terser({ sourcemap: true }));
  }

  if (!options.bundleDependencies) {
    config.external.push(
      ...Object.keys(getConsumerPackage().json?.dependencies ?? {}),
      ...Object.keys(getConsumerPackage().json?.peerDependencies ?? {})
    );
  }

  return config;
};
