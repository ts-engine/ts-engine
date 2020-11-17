import path from "path";
import { Arguments, CommandBuilder } from "yargs";
import * as rollup from "rollup";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import typescript from "typescript";
import { terser } from "rollup-plugin-terser";
import { preserveShebangs } from "rollup-plugin-preserve-shebangs";
import builtInModules from "builtin-modules";
import {
  getSupportedExtensions,
  extractFilename,
  trimExtension,
} from "../utils";

const name = "build <inputs...>";

const description = "Build code using ESBuild.";

const builder: CommandBuilder = (yargs) => {
  yargs.positional("inputs", { type: "string" }).requiresArg("inputs");
  yargs.boolean("w").alias("w", "watch").default("watch", false);
  yargs.boolean("skip-typecheck").default("skip-typecheck", false);
  yargs.boolean("bundle").default("bundle", false);
  yargs.boolean("minify").default("minify", true);

  return yargs;
};

interface BuildArgs {
  watch: boolean;
  skipTypecheck: boolean;
  bundle: boolean;
  inputs: string[];
  minify: boolean;
}

const handler = async (argv: Arguments<BuildArgs>) => {
  const filesToTypecheck: string[] = [];

  for (let input of argv.inputs) {
    const plugins = [
      {
        name: "ts-engine-plugin",
        load: (source: string) => {
          if (source.startsWith(".") || source.endsWith(input)) {
            filesToTypecheck.push(source);
          }

          return null;
        },
      },
      preserveShebangs(),
      json(),
      resolve({
        extensions: getSupportedExtensions({ dots: true }),
        preferBuiltins: true,
      }),
      babel({
        exclude: "node_modules/**",
        extensions: getSupportedExtensions({ dots: true }),
        babelHelpers: "runtime",
        presets: ["@ts-engine/babel-preset"],
      }),
      commonjs(),
      ...(argv.minify ? [terser()] : []),
    ];

    let filename = trimExtension(extractFilename(input));
    const dir = path.dirname(input).replace(/\/?src\/?/, "");

    const outputs: rollup.OutputOptions[] = [
      {
        file: path.join("dist", dir, `${filename}.cjs.js`),
        format: "cjs",
        sourcemap: true,
      },
      {
        file: path.join("dist", dir, `${filename}.esm.js`),
        format: "es",
        sourcemap: true,
      },
    ];

    const bundle = await rollup.rollup({
      input: input,
      plugins,
      output: outputs,
      external: (id: string) => {
        if (id === input) {
          return false;
        }

        if (argv.bundle) {
          return builtInModules.includes(id);
        }

        return (
          builtInModules.includes(id) ||
          (!id.startsWith(".") && !path.isAbsolute(id))
        );
      },
    });

    for (let output of outputs) {
      await bundle.write(output);
      console.log(`${input} -> ${output.file}`);

      if (!argv.skipTypecheck) {
        const typescriptOptions = {
          noEmit: false,
          declaration: true,
          emitDeclarationOnly: true,
          esModuleInterop: true,
          jsx: typescript.JsxEmit.React,
          lib: ["lib.esnext.d.ts", "lib.dom.d.ts"],
          resolveJsonModule: true,
          skipLibCheck: true,
          strict: true,
          outDir: "dist",
          allowJs: true,
          experimentalDecorators: true,
        };

        let program = typescript.createProgram(
          filesToTypecheck,
          typescriptOptions
        );

        let emitResult = program.emit();

        const allDiagnostics = typescript
          .getPreEmitDiagnostics(program)
          .concat(emitResult.diagnostics);

        if (allDiagnostics.length > 0) {
          const host = typescript.createCompilerHost(typescriptOptions);
          const output = typescript.formatDiagnosticsWithColorAndContext(
            allDiagnostics,
            host
          );

          console.error(output);
          process.exit(1);
        }
      }
    }
  }
};

export const build = {
  name,
  description,
  builder,
  handler,
};
