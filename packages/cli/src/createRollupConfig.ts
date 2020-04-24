import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import { preserveShebangs } from "rollup-plugin-preserve-shebangs";
import builtInModules from "builtin-modules";
import { getTsEngineConfig } from "./getTsEngineConfig";
import { getBabelConfigFilename } from "./getBabelConfigFilename";
import { getConsumerPackage } from "./utils/package";
import type { RollupConfig, OutputType } from "./types";

export const createRollupConfig = (
  outputType: OutputType,
  bundleDependencies: boolean
): RollupConfig => {
  const tsEngineConfig = getTsEngineConfig();
  const extensions = tsEngineConfig.extensions.map((x) => `.${x}`);
  const libraryOutput = [
    {
      file: tsEngineConfig.outputLibraryCjsFilename,
      format: "cjs",
    },
    {
      file: tsEngineConfig.outputLibraryEsmFilename,
      format: "es",
    },
  ];
  const nodeAppOutput = [
    {
      file: tsEngineConfig.outputNodeAppFilename,
      format: "cjs",
    },
  ];

  return {
    input: tsEngineConfig.entryFilename,
    output: outputType === "library" ? libraryOutput : nodeAppOutput,
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
        configFile: getBabelConfigFilename(),
        runtimeHelpers: true,
      }),
      terser(),
    ],
    external: [
      // don't try and bundle in native built in node modules like 'path' and 'fs'
      ...builtInModules,
      // only include dependencies if option provided to do so
      ...(bundleDependencies
        ? []
        : Object.keys(getConsumerPackage().json?.dependencies ?? {})),
    ],
  };
};
