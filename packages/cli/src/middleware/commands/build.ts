import { Context, NextFunction } from "@leecheneler/cli";
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
import { SUPPORTED_EXTENSIONS_WITH_DOTS } from "../../constants";
import { PackageJsonContext } from "../package-json";
import { runTypescript } from "../../run-typescript";

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
  bundle: boolean;
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

interface BuildOptions {
  watch: boolean;
  minify: boolean;
  "skip-typecheck": boolean;
  bundle: boolean;
}

export const build = () => async (
  ctx: Context<BuildOptions> & PackageJsonContext,
  next: NextFunction
) => {
  const [...filepaths] = ctx.options._;

  // assert all filepaths exist and are inside src/
  for (let filepath of filepaths) {
    const absoluteFilepath = path.resolve(filepath);

    if (!absoluteFilepath.startsWith(ctx.package.srcDir)) {
      ctx.throw(1, `${filepath} is not inside the src directory.`);
    }

    if (!fs.pathExistsSync(absoluteFilepath)) {
      ctx.throw(1, `${filepath} not found.`);
    }
  }

  // typecheck
  if (!ctx.options["skip-typecheck"]) {
    const result = runTypescript();

    if (result.passed) {
      console.log(result.output);
    } else {
      ctx.throw(1, result.output);
    }
  }

  // build each file
  for (let filepath of filepaths) {
    const rollupConfig = buildRollupConfig({
      bundle: ctx.options.bundle,
      input: filepath,
      minify: ctx.options.minify,
    });
    const outputOptions = rollupConfig.output as OutputOptions[];

    if (!ctx.options.watch) {
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
          } catch (e) {
            console.error(e.toString());
            process.exit(1);
          }
        })
      );
    }
  }

  await next();
};
