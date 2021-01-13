import { createCli as createLeeChenelerCli } from "@leecheneler/cli";
import pkg from "../package.json";
import { build } from "./middleware/commands/build";
import { lint } from "./middleware/commands/lint";
import { test } from "./middleware/commands/_test";
import { packageJson } from "./middleware/package-json";

export const createCli = () => {
  const cli = createLeeChenelerCli({
    description: pkg.description,
    name: "tse",
    version: pkg.version,
  })
    .use(packageJson())
    .useCommand("build", "Build files.", build(), {
      arguments: [
        {
          name: "watch",
          description: "Watch files and rebuild on changes.",
          type: "boolean",
        },
        {
          name: "typecheck",
          description: "Typecheck code.",
          type: "boolean",
        },
        {
          name: "bundle",
          description: "Bundle dependencies into output code.",
          type: "boolean",
        },
        {
          name: "minify",
          description: "Minify output code.",
          type: "boolean",
        },
      ],
      positionals: [
        {
          name: "filepaths",
          description: "Files to build.",
          type: "string",
          array: true,
          required: true,
        },
      ],
    })
    .useCommand("lint", "Lint files using ESLint.", lint(), {
      arguments: [
        {
          name: "fix",
          description: "Fix fixable lint issues.",
          type: "boolean",
        },
      ],
      positionals: [
        {
          name: "globs",
          description: "Globs to locate files to lint.",
          type: "string",
          array: true,
          required: true,
        },
      ],
    })
    .useCommand(
      "test",
      "Run tests using Jest, all options are forwarded onto Jest.",
      test(),
      {}
    )
    .useCommand("run", "Build and run a file.", test(), {
      arguments: [
        {
          name: "watch",
          description: "Watch files and rebuild on changes.",
          type: "boolean",
        },
        {
          name: "typecheck",
          description: "Typecheck code.",
          type: "boolean",
        },
        {
          name: "bundle",
          description: "Bundle dependencies into output code.",
          type: "boolean",
        },
        {
          name: "minify",
          description: "Minify output code.",
          type: "boolean",
        },
      ],
      positionals: [
        {
          name: "filepath",
          description: "File to build and run.",
          type: "string",
          required: true,
        },
      ],
    });

  return cli;
};
