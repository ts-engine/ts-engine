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
import { typecheck } from "./typecheck";

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
      options.throw(1, `${filepath} is not inside the src directory.`);
    }

    if (!fs.pathExistsSync(absoluteFilepath)) {
      options.throw(1, `${filepath} not found.`);
    }
  }

  // typecheck
  if (!options.skipTypecheck) {
    const result = await typecheck();

    if (result.passed) {
      console.log(result.output);
    } else {
      options.throw(1, result.output);
    }
  }

  // build each file
  for (let filepath of filepaths) {
    const rollupConfig = buildRollupConfig({
      input: filepath,
      minify: options.minify,
    });
    const outputOptions = rollupConfig.output as OutputOptions[];

    if (!options.watch) {
      const bundle = await rollup.rollup({
        ...rollupConfig,
      });

      await Promise.all(
        outputOptions.map(async (output: OutputOptions) => {
          const start = Date.now();
          try {
            await bundle.write(output);
            const end = Date.now();
            const duration = prettyMs(end - start);
            console.log(`${filepath} -> ${output.file} (${duration})`);

            options.onBuildComplete &&
              options.onBuildComplete({
                filepath: output.file as string,
                format: output.format as "cjs" | "es",
              });
          } catch (e) {
            console.error(e.toString());
            process.exit(1);
          }
        })
      );
    } else {
      // only need a label prefix when more than one input
      const label =
        filepaths.length === 1 ? "" : formatRandomColor(`[${filepath}] `);
      const prefixLabel = (s: string) =>
        `${label}${s.split("\n").join(`\n${label}`)}`;

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

            for (let output of outputOptions) {
              console.log(
                prefixLabel(`${filepath} -> ${output.file} (${time} combined)`)
              );
            }

            if (!options.skipTypecheck) {
              try {
                // typecheck({ files: filesToTypecheck[filepath] });
                // console.log(
                //   prefixLabel("Type definition files written to dist/")
                // );
              } catch (e) {
                console.log(prefixLabel(e.toString()));
              }
            }

            for (let output of outputOptions) {
              options.onBuildComplete &&
                options.onBuildComplete({
                  filepath: output.file as string,
                  format: output.format as "cjs" | "es",
                });
            }

            console.log(prefixLabel("Watching for changes..."));
            break;
          }
          case "ERROR": {
            console.error(prefixLabel(event.error.toString()));
            console.log(prefixLabel("Watching for changes..."));
            break;
          }
          default: {
            break;
          }
        }
      });
    }
  }
};
