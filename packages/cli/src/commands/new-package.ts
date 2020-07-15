import { spawnSync } from "child_process";
import path from "path";
import fs from "fs-extra";
import { logProgress } from "../log-progress";

interface NewPackageOptions {
  buildType: "library" | "node-app";
  name: string;
  react: boolean;
}

const getNpmVersion = (packageName: string): string => {
  return spawnSync("npm", ["show", packageName, "version"], {
    encoding: "utf8",
    shell: true,
  }).stdout.replace("\n", "");
};

export const newPackage = async (options: NewPackageOptions) => {
  const newPackageDir = path.resolve(
    process.cwd(),
    options.name.startsWith("@") ? options.name.split("/")[1] : options.name
  );

  // Obtain latest versions from NPM
  const tsEngineCliVersion = getNpmVersion("@ts-engine/cli");
  const reactVersion = getNpmVersion("react");
  const reactDomVersion = getNpmVersion("react-dom");
  const reactTypesVersion = getNpmVersion("@types/react");
  const reactDomTypesVersion = getNpmVersion("@types/react-dom");

  const writeFiles = async () => {
    await fs.ensureDir(newPackageDir);
    const reactOption = options.react ? " --react" : "";

    // Write package.json
    const libraryPackageJson = {
      name: options.name,
      version: "1.0.0",
      private: false,
      main: "dist/main.cjs.js",
      module: "dist/main.esm.js",
      types: "dist/main.d.ts",
      sideEffects: false,
      scripts: {
        build: `ts-engine build --library${reactOption}`,
        lint: `ts-engine lint${reactOption}`,
        test: `ts-engine test${reactOption}`,
        typecheck: "ts-engine typecheck --emit",
      },
      devDependencies: {
        "@ts-engine/cli": `^${tsEngineCliVersion}`,
        ...(options.react
          ? {
              "@types/react": `^${reactTypesVersion}`,
              "@types/react-dom": `^${reactDomTypesVersion}`,
              react: `^${reactVersion}`,
              "react-dom": `^${reactDomVersion}`,
            }
          : {}),
      },
      ...(options.react
        ? {
            peerDependencies: {
              react: `^${reactVersion}`,
              "react-dom": `^${reactDomVersion}`,
            },
          }
        : {}),
    };

    const nodeAppPackageJson = {
      name: options.name,
      version: "1.0.0",
      private: true,
      scripts: {
        build: `ts-engine build --node-app${reactOption}`,
        lint: `ts-engine lint${reactOption}`,
        start: `ts-engine start${reactOption}`,
        test: `ts-engine test${reactOption}`,
        typecheck: "ts-engine typecheck",
      },
      dependencies: {
        "@ts-engine/runtime": `^${tsEngineCliVersion}`,
        ...(options.react
          ? { react: `^${reactVersion}`, "react-dom": `^${reactDomVersion}` }
          : {}),
      },
      devDependencies: {
        "@ts-engine/cli": `^${tsEngineCliVersion}`,
        ...(options.react
          ? {
              "@types/react": `^${reactTypesVersion}`,
              "@types/react-dom": `^${reactDomTypesVersion}`,
            }
          : {}),
      },
    };

    await fs.writeJSON(
      path.resolve(newPackageDir, "package.json"),
      options.buildType === "node-app"
        ? nodeAppPackageJson
        : libraryPackageJson,
      { encoding: "utf8", spaces: 2 }
    );

    // Write src file
    await fs.ensureFile(path.resolve(newPackageDir, "src/main.ts"));

    const librarySrc = `export const printHelloWorld = () => {
  console.log("hello world");
};
`;
    const nodeAppSrc = `console.log("hello world");
`;

    await fs.writeFile(
      path.resolve(newPackageDir, "src/main.ts"),
      options.buildType === "node-app" ? nodeAppSrc : librarySrc,
      { encoding: "utf8" }
    );
  };

  await logProgress(writeFiles(), "Writing package files", "new-package-write");

  // Install ts-engine
  spawnSync("yarn", {
    cwd: newPackageDir,
    stdio: "inherit",
    shell: true,
  });
};
