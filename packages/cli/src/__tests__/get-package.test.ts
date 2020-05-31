import mockFs from "mock-fs";
import { getPackage } from "../get-package";

describe("getPackage", () => {
  afterEach(() => {
    mockFs.restore();
  });

  it("should return package details", () => {
    const packageJson = {
      name: "name",
      description: "description",
      repository: {
        url: "repository/url",
      },
      version: "1.0.0",
      dependencies: {
        react: "16.0.0",
      },
      peerDependencies: {
        "react-dom": "16.0.0",
      },
      main: "main.js",
      module: "main.js",
      types: "main.js",
    };

    mockFs({
      "package.json": JSON.stringify(packageJson),
      src: {
        "main.ts": "",
        nested: {
          "other.ts": "",
        },
      },
    });

    expect(getPackage()).toEqual({
      dir: process.cwd(),
      json: packageJson,
      srcFilepaths: ["src/main.ts", "src/nested/other.ts"],
    });
  });
});
