import chalk from "chalk";
import chokidar from "chokidar";
import { debounce } from "debounce";
import { getPackage } from "../get-package";
import { srcFileGlob } from "../constants";
import { typecheck as doTypecheck } from "../typecheck";

interface TypecheckOptions {
  emit: boolean;
  watch: boolean;
}

export const typecheck = async (options: TypecheckOptions) => {
  const pkg = getPackage();

  if (options.watch) {
    const watcher = chokidar.watch(srcFileGlob, { cwd: pkg.dir });
    watcher.on("ready", async () => {
      const typecheckOptions = {
        emit: options.emit,
        package: pkg,
      };

      // Run initial typecheck
      await doTypecheck(typecheckOptions);

      // Then on each change typecheck again, we debounce this in order
      // to try and accomodate saving multiple files in once go
      watcher.on(
        "all",
        debounce(
          async () => {
            console.clear();
            await doTypecheck(typecheckOptions);
            console.log(chalk.grey("Watching for changes..."));
          },
          350,
          false
        )
      );
      console.log(chalk.grey("Watching for changes..."));
    });

    await new Promise(() => {});
  } else {
    const result = await doTypecheck({
      emit: options.emit,
      package: pkg,
    });

    process.exit(result ? 0 : 1);
  }
};
