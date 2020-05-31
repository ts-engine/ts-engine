import path from "path";
import typescript from "typescript";
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
  outputDir,
} from "./constants";

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

type ExternalFn = (id: string) => boolean;
export interface RollupConfig {
  input: string;
  output: {
    file: string;
    format: string;
  }[];
  plugins: any[];
  external: ExternalFn;
}

export const createRollupConfig = (
  options: CreateRollupConfigOptions
): RollupConfig => {
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
    external: (id: string) => {
      if (options.bundleDependencies) {
        return builtInModules.includes(id);
      }

      return (
        builtInModules.includes(id) ||
        (!id.startsWith(".") && !path.isAbsolute(id))
      );
    },
  };

  if (options.minify) {
    config.plugins.push(terser());
  }

  return config;
};

interface CreateESLintConfigOptions {
  react: boolean;
}

export const createESLintConfig = (options: CreateESLintConfigOptions) => {
  if (options.react) {
    return {
      extends: ["@ts-engine/eslint-config", "@ts-engine/eslint-config-react"],
    };
  }

  return {
    extends: ["@ts-engine/eslint-config"],
  };
};

interface CreateTypeScriptConfigOptions {
  emit: boolean;
}

export const createTypeScriptConfig = (
  options: CreateTypeScriptConfigOptions
) => {
  return {
    noEmit: !options.emit,
    declaration: true,
    emitDeclarationOnly: options.emit,
    esModuleInterop: true,
    jsx: typescript.JsxEmit.React,
    lib: ["lib.esnext.d.ts", "lib.dom.d.ts"],
    resolveJsonModule: true,
    skipLibCheck: true,
    strict: true,
    outDir: outputDir,
    allowJs: true,
  };
};
