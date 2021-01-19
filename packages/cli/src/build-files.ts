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

const isNpmModule = (module: string) => {
  const isBuiltIn = builtInModules.includes(module);
  const isRelativeFile = module.startsWith(".");
  const isAbsoluteFile = path.isAbsolute(module);

  return isBuiltIn || (!isRelativeFile && !isAbsoluteFile);
};

const getFilenameFromFilepath = (filepath: string) => {
  return filepath.substr(Math.max(0, filepath.lastIndexOf("/")));
};

interface BuildRollupConfigOptions {
  input: string;
  minify: boolean;
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
    babel({
      exclude: "node_modules/**",
      extensions: SUPPORTED_EXTENSIONS_WITH_DOTS,
      babelHelpers: "runtime",
      presets: ["@ts-engine/babel-preset"],
    }),
    commonjs(),
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
  const outputs: rollup.OutputOptions[] = [
    {
      file: path.join(dir, `${filenameWithNoExtension}.cjs`),
      format: "cjs",
      sourcemap: true,
    },
    {
      file: path.join(dir, `${filenameWithNoExtension}.js`),
      format: "es",
      sourcemap: true,
    },
  ];

  return {
    input: options.input,
    plugins,
    output: outputs,
    external: (id: string) => {
      // input file is not an external
      if (id === options.input) {
        return false;
      }

      // external if its a built in node module like 'fs' or 'path
      // or if the modsule is not a relative path and also doesn't point
      // to a file on disk
      return isNpmModule(id);
    },
  };
};

interface BuildFilesOptions {
  watch: boolean;
  minify: boolean;
  skipTypecheck: boolean;
  srcDir: string;
  throw: (code: number, message: string) => void;
  onBuildComplete?: (output: {
    filepath: string;
    format: "cjs" | "es";
    passedTypecheck: boolean;
  }) => void;
}

export const buildFiles = async (
  filepaths: string[],
  options: BuildFilesOptions
) => {
  // assert all filepaths exist and are inside src/
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

  const allOutputOptions: OutputOptions[] = [];

  // build each file
  for (let filepath of filepaths) {
    const rollupConfig = buildRollupConfig({
      input: filepath,
      minify: options.minify,
    });
    const outputOptions = rollupConfig.output as OutputOptions[];
    allOutputOptions.push(...outputOptions);

    if (!options.watch) {
      try {
        const bundle = await rollup.rollup({
          ...rollupConfig,
        });

        await Promise.all(
          outputOptions.map(async (output: OutputOptions) => {
            const start = Date.now();
            await bundle.write(output);
            const end = Date.now();
            const duration = prettyMs(end - start);
            console.log(
              chalk.cyan`${filepath} ${chalk.bold`->`} ${
                output.file
              } (${chalk.bold`${duration}`})`
            );
          })
        );
      } catch (e) {
        options.throw(1, chalk.redBright(e));
      }
    } else {
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
              for (let output of outputOptions) {
                console.log(
                  prefixLabel(
                    chalk.cyan`${filepath} ${chalk.bold`->`} ${
                      output.file
                    } (${chalk.bold`${time}`})`
                  )
                );
              }

              let typecheckResult: RunTypescriptResult | null = null;
              if (!options.skipTypecheck) {
                typecheckResult = await typecheck(filepaths);
                console.log(prefixLabel(typecheckResult.output));
              }

              for (let output of outputOptions) {
                options.onBuildComplete &&
                  options.onBuildComplete({
                    filepath: output.file as string,
                    format: output.format as "cjs" | "es",
                    passedTypecheck: typecheckResult?.passed ?? true,
                  });
              }
            }

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
  }

  if (!options.watch) {
    // typecheck only if not in watch mode
    if (!options.skipTypecheck) {
      const result = await typecheck(filepaths);

      if (result.passed) {
        console.log(result.output);
      } else {
        options.throw(1, result.output);
      }
    }

    // report build succeeded for each output
    for (let output of allOutputOptions) {
      options.onBuildComplete &&
        options.onBuildComplete({
          filepath: output.file as string,
          format: output.format as "cjs" | "es",
          passedTypecheck: true,
        });
    }
  }
};
