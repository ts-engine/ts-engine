import { spawn, ChildProcess } from "child_process";
import { Context } from "@leecheneler/cli";
import { PackageJsonContext } from "../package-json";
import { buildFiles } from "../../build-files";

interface RunOptions {
  watch: boolean;
  minify: boolean;
  "skip-typecheck": boolean;
}

export const run = () => async (
  ctx: Context<RunOptions> & PackageJsonContext
) => {
  const [filepath] = ctx.options._;
  const filepathIndex = ctx.rawOptions.indexOf(filepath);
  const forwardedArgs =
    ctx.rawOptions.length > filepathIndex + 1
      ? ctx.rawOptions.slice(filepathIndex + 1)
      : [];

  let runner: ChildProcess | null = null;
  const killRunner = () => {
    if (runner) {
      (runner as ChildProcess).kill();
      runner = null;
    }
  };

  const onBuildComplete = (output: {
    filepath: string;
    format: "cjs" | "es";
  }) => {
    if (output.format === "cjs") {
      killRunner();
      runner = spawn("node", [output!.filepath, ...forwardedArgs], {
        stdio: "inherit",
      });

      runner!.stdout?.setEncoding("utf8");
      runner!.stderr?.setEncoding("utf8");

      // forward code of child process if not in watch mode
      if (!ctx.options.watch) {
        runner.on("close", (code) => {
          process.exit(code ?? 0);
        });
      }
    }
  };

  await buildFiles([filepath], {
    minify: ctx.options.minify,
    skipTypecheck: ctx.options["skip-typecheck"],
    watch: ctx.options.watch,
    srcDir: ctx.package.srcDir,
    throw: ctx.throw,
    onBuildComplete,
  });

  // wait for promise that will never resolve,
  // we want the user kill the process or the app closing to
  await new Promise(() => {});
};
