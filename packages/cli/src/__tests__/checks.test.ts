import mockFs from "mock-fs";
import {
  checkBuildTypeOptions,
  checkLibraryNpmPackageJson,
  checkNewPackageFolderIsAvailable,
  checkNpmPackageName,
} from "../checks";

describe("checks", () => {
  afterEach(() => {
    mockFs.restore();
  });

  describe("checkBuildTypeOptions", () => {
    it("should enforce a build type is provided", () => {
      expect(() => {
        checkBuildTypeOptions({
          nodeApp: false,
          library: false,
        });
      }).toThrowError("Missing one of required arguments: library, node-app");
    });

    it("should enforce only one build type is provided", () => {
      expect(() => {
        checkBuildTypeOptions({
          nodeApp: true,
          library: true,
        });
      }).toThrowError("Arguments library and node-app are mutually exclusive");
    });

    it("should accept a build type", () => {
      expect(
        checkBuildTypeOptions({
          nodeApp: true,
          library: false,
        })
      ).toBe(true);

      expect(
        checkBuildTypeOptions({
          nodeApp: false,
          library: true,
        })
      ).toBe(true);
    });
  });

  describe("checkNpmPackageName", () => {
    it("should enforce valid npm package names", () => {
      expect(() => {
        checkNpmPackageName({ name: "]]]" });
      }).toThrow(`']]]' is not a valid npm package name:

- name can only contain URL-friendly characters`);
    });

    it("should accept valid npm package names", () => {
      expect(checkNpmPackageName({ name: "hello" })).toBe(true);
      expect(checkNpmPackageName({ name: "@hello/world" })).toBe(true);
    });
  });

  describe("checkLibraryNpmPackageJson", () => {
    it("should pass a valid package.json", () => {
      mockFs({
        "package.json": JSON.stringify({
          main: "dist/main.cjs.js",
          module: "dist/main.esm.js",
          types: "dist/main.d.ts",
        }),
      });

      expect(checkLibraryNpmPackageJson({ library: true })).toBe(true);
    });

    it("should not check package.json when not building a library", () => {
      mockFs({
        "package.json": JSON.stringify({
          main: "dist/main.wrong.js",
          module: "dist/main.wrong.js",
          types: "dist/main.wrong.ts",
        }),
      });

      expect(checkLibraryNpmPackageJson({ library: false })).toBe(true);
    });

    it("should enforce package.main set correctly", () => {
      mockFs({
        "package.json": JSON.stringify({
          main: "dist/main.wrong.js",
          module: "dist/main.esm.js",
          types: "dist/main.d.ts",
        }),
      });

      expect(() => checkLibraryNpmPackageJson({ library: true })).toThrowError(
        "Incorrectly configured package.json, set 'main' to 'dist/main.cjs.js'"
      );
    });

    it("should enforce package.module set correctly", () => {
      mockFs({
        "package.json": JSON.stringify({
          main: "dist/main.cjs.js",
          module: "dist/main.wrong.js",
          types: "dist/main.d.ts",
        }),
      });

      expect(() => checkLibraryNpmPackageJson({ library: true })).toThrowError(
        "Incorrectly configured package.json, set 'module' to 'dist/main.esm.js'"
      );
    });

    it("should enforce package.types set correctly", () => {
      mockFs({
        "package.json": JSON.stringify({
          main: "dist/main.cjs.js",
          module: "dist/main.esm.js",
          types: "dist/main.wrong.ts",
        }),
      });

      expect(() => checkLibraryNpmPackageJson({ library: true })).toThrowError(
        "Incorrectly configured package.json, set 'types' to 'dist/main.d.ts'"
      );
    });
  });

  describe("checkNewPackageFolderIsAvailable", () => {
    it("should pass if the folder is available", () => {
      expect(checkNewPackageFolderIsAvailable({ name: "new-package" })).toBe(
        true
      );
      expect(
        checkNewPackageFolderIsAvailable({ name: "@scoped/new-package" })
      ).toBe(true);
    });

    it("should enforce the folder must be available", () => {
      mockFs({
        "new-package": {},
      });

      expect(() =>
        checkNewPackageFolderIsAvailable({ name: "new-package" })
      ).toThrowError("Folder 'new-package' already exists");
      expect(() =>
        checkNewPackageFolderIsAvailable({ name: "@scoped/new-package" })
      ).toThrowError("Folder 'new-package' already exists");
    });
  });
});
