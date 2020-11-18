import path from "path";
import rollup, { RollupOptions, Plugin, OutputOptions } from "rollup";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import { preserveShebangs } from "rollup-plugin-preserve-shebangs";
import builtInModules from "builtin-modules";
import prettyMs from "pretty-ms";
import { supportedExtensionsWithDot } from "./constants";
import { typecheck } from "./typecheck";
import { logger, formatRandomColor } from "./logger";

const isNpmModule = (module: string) => {
  const isBuiltIn = builtInModules.includes(module);
  const isRelativeFile = module.startsWith(".");
  const isAbsoluteFile = path.isAbsolute(module);

  return isBuiltIn || (!isRelativeFile && !isAbsoluteFile);
};

const getFilenameFromFilepath = (filepath: string) => {
  return filepath.substr(Math.max(0, filepath.lastIndexOf("/")));
};

interface GetRollupConfigOptions {
  input: string;
  minify: boolean;
  bundle: boolean;
  additionalPlugins: Plugin[];
}

const getRollupConfig = (options: GetRollupConfigOptions): RollupOptions => {
  // configure plugins
  const plugins = [
    ...options.additionalPlugins,
    preserveShebangs(),
    json(),
    resolve({
      extensions: supportedExtensionsWithDot,
      preferBuiltins: true,
    }),
    babel({
      exclude: "node_modules/**",
      extensions: supportedExtensionsWithDot,
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
  // of a 'src' folder, so we remove the src folder build building the dist path
  const dir = path.dirname(options.input).replace(/\/?src\/?/, "");
  const filename = getFilenameFromFilepath(options.input);
  const filenameWithNoExtension = filename.split(".").slice(0, -1).join(".");
  const outputs: rollup.OutputOptions[] = [
    {
      file: path.join("dist", dir, `${filenameWithNoExtension}.cjs.js`),
      format: "cjs",
      sourcemap: true,
    },
    {
      file: path.join("dist", dir, `${filenameWithNoExtension}.esm.js`),
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

      // if we're bundling externals then only exclude nodejs' built
      // in modules like 'fs' and 'path' etc
      if (options.bundle) {
        return builtInModules.includes(id);
      }

      // external if its a built in node module like 'fs' or 'path
      // or if the modsule is not a relative path and also doesn't point
      // to a file on disk
      return isNpmModule(id);
    },
  };
};

export interface BuildOptions {
  filepaths: string[];
  watch: boolean;
  typecheck: boolean;
  bundle: boolean;
  minify: boolean;
}

export const build = async (options: BuildOptions) => {
  const filesToTypecheck: string[] = [];
  const filesToTypecheckExtractorPlugin: Plugin = {
    name: "ts-engine-files-to-typecheck-extractor-plugin",
    load: (source: string) => {
      // If the path is relative or an input filepath then add it to
      // be typechecked unless it has already been added
      if (!isNpmModule(source) && !filesToTypecheck.includes(source)) {
        filesToTypecheck.push(source);
      }

      return null;
    },
  };

  for (let filepath of options.filepaths) {
    const rollupConfig = getRollupConfig({
      additionalPlugins: [filesToTypecheckExtractorPlugin],
      bundle: options.bundle,
      input: filepath,
      minify: options.minify,
    });

    if (!options.watch) {
      const bundle = await rollup.rollup(rollupConfig);

      await Promise.all(
        (rollupConfig.output as OutputOptions[]).map(
          async (output: OutputOptions) => {
            // generate and write output file, time the process to report it
            const start = Date.now();
            await bundle.write(output);
            const end = Date.now();
            const time = prettyMs(end - start);
            logger.success(`${filepath} -> ${output.file} (${time})`);
          }
        )
      );

      if (options.typecheck) {
        typecheck({ files: filesToTypecheck });
        logger.success("Type definition files written to dist/");
      }
    } else {
      const watcher = rollup.watch(rollupConfig);
      let start = 0;
      let end = 0;
      const label = formatRandomColor(`[${filepath}]`);
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
            break;
          }
          case "END": {
            end = Date.now();
            const time = prettyMs(end - start);

            for (let output of rollupConfig.output as OutputOptions[]) {
              logger.success(
                `${label} ${filepath} -> ${output.file} (${time} combined)`
              );
            }

            if (options.typecheck) {
              try {
                typecheck({ files: filesToTypecheck });
                logger.success(
                  `${label} Type definition files written to dist/`
                );
              } catch (e) {
                logger.error(e.toString());
              }
            }

            logger.subtext(`${label} Watching for changes...`);
            break;
          }
          case "ERROR": {
            logger.error(event.error.toString());
            logger.subtext(`${label} Watching for changes...`);
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
