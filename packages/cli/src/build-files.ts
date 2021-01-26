import path from "path";
import fs from "fs-extra";
import type { RollupOptions, OutputOptions } from "rollup";
import * as rollup from "rollup";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import { preserveShebangs } from "rollup-plugin-preserve-shebangs";
import builtInModules from "builtin-modules";
import prettyMs from "pretty-ms";
import chalk from "chalk";
import randomColor from "randomcolor";
import { SUPPORTED_EXTENSIONS_WITH_DOTS } from "./constants";
import { RunTypescriptResult, typecheck } from "./typecheck";

export const formatRandomColor = (str: string) => {
  return chalk.hex(randomColor({ luminosity: "bright" }))(str);
};

const getFilenameFromFilepath = (filepath: string) => {
  return filepath.substr(Math.max(0, filepath.lastIndexOf("/")));
};

interface BuildRollupConfigOptions {
  input: string;
  minify: boolean;
  bundle: boolean;
  output: "cjs" | "esm";
  dependencies: string[];
}

const buildRollupConfig = (
  options: BuildRollupConfigOptions
): RollupOptions => {
  // configure plugins
  const plugins = [
    preserveShebangs(),
    json(),
    resolve({
      extensions: SUPPORTED_EXTENSIONS_WITH_DOTS,
      preferBuiltins: true,
    }),
    commonjs(),
    babel({
      exclude: "node_modules/**",
      extensions: SUPPORTED_EXTENSIONS_WITH_DOTS,
      babelHelpers: "runtime",
      presets: ["@ts-engine/babel-preset"],
    }),
  ];

  // terser minifies code so only apply it if minifying
  if (options.minify) {
    plugins.push(terser());
  }

  // determine the output file for the given input, output is mapped to the dist folder,
  // path structure is maintained, but special consideration is given to the convention
  // of a 'src' folder, so we replace the src folder when building the dist path
  const dir = path.dirname(options.input).replace("src", "dist");
  const filename = getFilenameFromFilepath(options.input);
  const filenameWithNoExtension = filename.split(".").slice(0, -1).join(".");
  const output: rollup.OutputOptions = {
    file: path.join(dir, `${filenameWithNoExtension}.js`),
    format: options.output,
    sourcemap: true,
  };

  return {
    input: options.input,
    plugins,
    output,
    external: (id: string) => {
      if (options.bundle) {
        return builtInModules.includes(id);
      }

      return (
        builtInModules.includes(id) ||
        (!id.startsWith(".") && !path.isAbsolute(id))
      );
    },
  };
};

interface AssertFilepathsOptions {
  throw: (code: number, message: string) => void;
  srcDir: string;
}

const assertFilepaths = (
  filepaths: string[],
  options: AssertFilepathsOptions
) => {
  for (let filepath of filepaths) {
    const absoluteFilepath = path.resolve(filepath);

    if (!absoluteFilepath.startsWith(options.srcDir)) {
      options.throw(
        1,
        chalk.redBright`${filepath} is not inside the src directory.`
      );
    }

    if (!fs.pathExistsSync(absoluteFilepath)) {
      options.throw(1, chalk.redBright`${filepath} not found.`);
    }
  }
};

interface BuildFilesOptions {
  minify: boolean;
  skipTypecheck: boolean;
  bundle: boolean;
  output: "cjs" | "esm";
  srcDir: string;
  dependencies: string[];
  throw: (code: number, message: string) => void;
  onBuildComplete?: (output: {
    filepath: string;
    format: "cjs" | "esm";
    passedTypecheck: boolean;
  }) => void;
}

export const buildFiles = async (
  filepaths: string[],
  options: BuildFilesOptions
) => {
  assertFilepaths(filepaths, { srcDir: options.srcDir, throw: options.throw });

  // build each file
  for (let filepath of filepaths) {
    const rollupConfig = buildRollupConfig({
      input: filepath,
      minify: options.minify,
      bundle: options.bundle,
      output: options.output,
      dependencies: options.dependencies,
    });
    const outputOptions = rollupConfig.output as OutputOptions;

    try {
      const bundle = await rollup.rollup({
        ...rollupConfig,
      });

      const start = Date.now();
      await bundle.write(outputOptions);
      const end = Date.now();
      const duration = prettyMs(end - start);
      console.log(
        chalk.cyan`${filepath} ${chalk.bold`->`} ${
          outputOptions.file
        } (${chalk.bold`${options.output}, ${duration}`})`
      );

      // report build succeeded for each output
      options.onBuildComplete &&
        options.onBuildComplete({
          filepath: outputOptions.file as string,
          format: outputOptions.format as "cjs" | "esm",
          passedTypecheck: true,
        });
    } catch (e) {
      options.throw(1, chalk.redBright(e));
    }
  }

  if (!options.skipTypecheck) {
    const result = await typecheck(filepaths);

    if (result.passed) {
      console.log(result.output);
    } else {
      options.throw(1, result.output);
    }
  }
};

interface BuildFilesAndWatchOptions {
  minify: boolean;
  skipTypecheck: boolean;
  bundle: boolean;
  output: "cjs" | "esm";
  srcDir: string;
  dependencies: string[];
  throw: (code: number, message: string) => void;
  onBuildComplete?: (output: {
    filepath: string;
    format: "cjs" | "esm";
    passedTypecheck: boolean;
  }) => void;
}

export const buildFilesAndWatch = async (
  filepaths: string[],
  options: BuildFilesAndWatchOptions
) => {
  assertFilepaths(filepaths, { srcDir: options.srcDir, throw: options.throw });

  // build each file
  for (let filepath of filepaths) {
    const rollupConfig = buildRollupConfig({
      input: filepath,
      minify: options.minify,
      bundle: options.bundle,
      output: options.output,
      dependencies: options.dependencies,
    });
    const outputOptions = rollupConfig.output as OutputOptions;

    // only need a label prefix when more than one input
    const label =
      filepaths.length === 1 ? "" : formatRandomColor(`[${filepath}] `);
    const prefixLabel = (s: string) =>
      `${label}${s.split("\n").join(`\n${label}`)}`;
    let currentError: rollup.RollupError | null = null;

    const watcher = rollup.watch({
      ...rollupConfig,
      watch: {
        exclude: ["node_modules/**", "dist/**", "coverage/**"],
        buildDelay: 300,
      },
    });
    let start = 0;
    let end = 0;

    watcher.on("event", async (event) => {
      switch (event.code) {
        case "START": {
          start = Date.now();
          break;
        }
        case "BUNDLE_START": {
          break;
        }
        case "BUNDLE_END": {
          // important to call this as per rollup docs so plugins can properly clean up
          event.result.close();
          break;
        }
        case "END": {
          end = Date.now();
          const time = prettyMs(end - start);

          if (currentError) {
            console.error(prefixLabel(chalk.redBright(currentError)));
            currentError = null;
          } else {
            console.log(
              prefixLabel(
                chalk.cyan`${filepath} ${chalk.bold`->`} ${
                  outputOptions.file
                } (${chalk.bold`${options.output}, ${time}`})`
              )
            );
          }

          let typecheckResult: RunTypescriptResult | null = null;
          if (!options.skipTypecheck) {
            typecheckResult = await typecheck(filepaths);
            console.log(prefixLabel(typecheckResult.output));
          }

          options.onBuildComplete &&
            options.onBuildComplete({
              filepath: outputOptions.file as string,
              format: outputOptions.format as "cjs" | "esm",
              passedTypecheck: typecheckResult?.passed ?? true,
            });

          console.log(prefixLabel(chalk.grey`Watching for changes...`));
          break;
        }
        case "ERROR": {
          currentError = event.error;
          break;
        }
        default: {
          break;
        }
      }
    });
  }
};
