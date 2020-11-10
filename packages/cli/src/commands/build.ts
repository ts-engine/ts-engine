import fs from "fs-extra";
import { Arguments, CommandBuilder } from "yargs";
import * as esbuild from "esbuild";
import * as typescript from "typescript";
import { findPackageJson } from "../utils";

const command = "build <entrypoints...>";

const description = "Build code using ESBuild.";

const builder: CommandBuilder = (yargs) => {
  yargs
    .positional("entrypoints", { type: "string" })
    .requiresArg("entrypoints");
  yargs.boolean("w").alias("w", "watch").default("watch", false);
  yargs.boolean("skip-typecheck").default("skip-typecheck", false);
  yargs.boolean("bundle").default("bundle", false);
  yargs.boolean("minify").default("minify", false);

  return yargs;
};

interface BuildArgs {
  watch: boolean;
  skipTypecheck: boolean;
  bundle: boolean;
  entrypoints: string[];
  minify: boolean;
}

const handler = async (argv: Arguments<BuildArgs>) => {
  const packageJson = findPackageJson();

  // when the bundle option is passed all externals are included in the build
  const external = argv.bundle
    ? []
    : [
        ...Object.keys(packageJson?.dependencies ?? {}),
        ...Object.keys(packageJson?.devDependencies ?? {}),
        ...Object.keys(packageJson?.peerDpendencies ?? {}),
      ];

  try {
    const filesToTypecheck: string[] = [];
    // first compile to common js, this is the build we allow to output warnings/errors
    // and we also capture files to typecheck
    const commonJsResults = await esbuild.build({
      bundle: true,
      external,
      entryPoints: argv.entrypoints,
      outdir: "dist",
      platform: "node",
      target: ["es2015"],
      format: "cjs",
      plugins: [
        {
          name: "typescript-file-path-catcher",
          setup: (build) => {
            build.onLoad(
              { filter: /^.+\.tsx?$/, namespace: "file" },
              (args) => {
                filesToTypecheck.push(args.path);
                return null;
              }
            );
          },
        },
      ],
      sourcemap: true,
      write: false,
      minify: argv.minify,
    });

    // perform typecheck before we output the cjs files, if the typechecking
    // fails then we won't output any build files
    if (!argv.skipTypecheck) {
      const typescriptOptions = {
        noEmit: true,
        declaration: false,
        emitDeclarationOnly: false,
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
        return process.exit(1);
      }
    }

    for (let file of commonJsResults.outputFiles ?? []) {
      await fs.ensureDir(file.path.substring(0, file.path.lastIndexOf("/")));
      await fs.writeFile(file.path, Buffer.from(file.contents));
      console.log(file.path);
    }

    // then compile es module js, we silent building warnings for this build to stop duplicate errors
    const esModuleResults = await esbuild.build({
      bundle: true,
      external,
      entryPoints: argv.entrypoints,
      outdir: "dist",
      platform: "node",
      target: ["es2015"],
      format: "esm",
      plugins: [],
      sourcemap: true,
      outExtension: {
        ".js": ".esm.js",
      },
      logLevel: "silent",
      write: false,
      minify: argv.minify,
    });

    for (let file of esModuleResults.outputFiles ?? []) {
      await fs.ensureDir(file.path.substring(0, file.path.lastIndexOf("/")));
      await fs.writeFile(file.path, Buffer.from(file.contents));
      console.log(file.path);
    }
  } catch (error) {
    console.error(error.message);
    return process.exit(1);
  }

  return process.exit(0);
};

export const build = {
  command,
  description,
  builder,
  handler,
};
