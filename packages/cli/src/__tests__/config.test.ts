import path from "path";
import typescript from "typescript";
import fs from "fs-extra";
import mockFs from "mock-fs";
import builtInModules from "builtin-modules";
import {
  entryFilepath,
  cjsOutputFilepath,
  esmOutputFilepath,
  outputFilepath,
  outputDir,
} from "../constants";
import {
  createBabelConfig,
  createESLintConfig,
  createJestConfig,
  createRollupConfig,
  createTypeScriptConfig,
} from "../config";

describe("config", () => {
  afterEach(() => {
    mockFs.restore();
  });

  describe("createBabelConfig", () => {
    it("should supply default babel config", () => {
      expect(createBabelConfig({ react: false })).toEqual({
        configFile: false,
        presets: ["@ts-engine/babel-preset"],
      });
    });

    it("should supply react babel config", () => {
      expect(createBabelConfig({ react: true })).toEqual({
        configFile: false,
        presets: ["@ts-engine/babel-preset-react", "@ts-engine/babel-preset"],
      });
    });

    it("should apply babel.config.js if found", () => {
      mockFs({
        "babel.config.js": "module.exports = {}",
      });

      expect(createBabelConfig({ react: false })).toEqual({
        configFile: path.resolve(process.cwd(), "babel.config.js"),
      });
    });
  });

  describe("createJestConfig", () => {
    afterEach(() => {
      if (fs.existsSync("jest.config.js")) {
        fs.removeSync("jest.config.js");
      }
      if (fs.existsSync("jest.setup.ts")) {
        fs.removeSync("jest.setup.ts");
      }
    });

    it("should supply default jest config", () => {
      expect(createJestConfig({ react: false })).toEqual({
        testRegex: "src/.*.test.(js|jsx|ts|tsx)$",
        testURL: "http://localhost",
        transform: {
          ".(js|jsx|ts|tsx)$": [
            "babel-jest",
            createBabelConfig({ react: false }),
          ],
        },
      });
    });

    it("should merge jest.config.js if found", () => {
      fs.writeFileSync("jest.config.js", "module.exports = { coverage: 90}");

      expect(createJestConfig({ react: false })).toEqual({
        testRegex: "src/.*.test.(js|jsx|ts|tsx)$",
        testURL: "http://localhost",
        transform: {
          ".(js|jsx|ts|tsx)$": [
            "babel-jest",
            createBabelConfig({ react: false }),
          ],
        },
        coverage: 90,
      });
    });

    it("should set jest.setup.ts if found", () => {
      fs.writeFileSync("jest.setup.ts", "");

      expect(createJestConfig({ react: false })).toEqual({
        testRegex: "src/.*.test.(js|jsx|ts|tsx)$",
        testURL: "http://localhost",
        transform: {
          ".(js|jsx|ts|tsx)$": [
            "babel-jest",
            createBabelConfig({ react: false }),
          ],
        },
        setupFilesAfterEnv: ["./jest.setup.ts"],
      });
    });
  });

  describe("createRollupConfig", () => {
    beforeEach(() => {
      const packageJson = {
        dependencies: {
          react: "16.0.0",
        },
        peerDependencies: {
          "react-dom": "16.0.0",
        },
      };
      mockFs({
        "package.json": JSON.stringify(packageJson),
      });
    });

    it("should be configured for library output", () => {
      const config = createRollupConfig({
        buildType: "library",
        bundleDependencies: false,
        minify: false,
        react: false,
      });

      expect(config).toMatchObject({
        input: entryFilepath,
        output: [
          {
            file: cjsOutputFilepath,
            format: "cjs",
            sourcemap: true,
          },
          {
            file: esmOutputFilepath,
            format: "es",
            sourcemap: true,
          },
        ],
      });
      expect(config.plugins).toHaveLength(5);
      [...builtInModules, "react", "react-dom"].forEach((id) => {
        expect(config.external(id)).toBe(true);
      });
    });

    it("should be configured for node-app output", () => {
      const config = createRollupConfig({
        buildType: "node-app",
        bundleDependencies: false,
        minify: false,
        react: false,
      });

      expect(config).toMatchObject({
        input: entryFilepath,
        output: [
          {
            file: outputFilepath,
            format: "cjs",
            sourcemap: true,
          },
        ],
      });
      expect(config.plugins).toHaveLength(5);
      [...builtInModules, "react", "react-dom"].forEach((id) => {
        expect(config.external(id)).toBe(true);
      });
    });

    it("should add terser plugin for minification", () => {
      const config = createRollupConfig({
        buildType: "node-app",
        bundleDependencies: false,
        minify: true,
        react: false,
      });

      // not sure how else to test this
      expect(config.plugins).toHaveLength(6);
    });

    it("should NOT add dependencies and peerDependencies to externals when bundling dependencies", () => {
      const config = createRollupConfig({
        buildType: "node-app",
        bundleDependencies: true,
        minify: false,
        react: false,
      });

      [...builtInModules].forEach((id) => {
        expect(config.external(id)).toBe(true);
      });
      ["react", "react-dom"].forEach((id) => {
        expect(config.external(id)).toBe(false);
      });
    });
  });

  describe("createESLintConfig", () => {
    it("should supply default eslint config", () => {
      const config = createESLintConfig({ react: false });

      expect(config).toEqual({
        extends: ["@ts-engine/eslint-config"],
      });
    });

    it("should supply react eslint config", () => {
      const config = createESLintConfig({ react: true });

      expect(config).toEqual({
        extends: ["@ts-engine/eslint-config", "@ts-engine/eslint-config-react"],
      });
    });
  });

  describe("createTypeScriptConfig", () => {
    it("should return emitting config", () => {
      expect(createTypeScriptConfig({ emit: true })).toEqual({
        noEmit: false,
        declaration: true,
        emitDeclarationOnly: true,
        esModuleInterop: true,
        jsx: typescript.JsxEmit.React,
        lib: ["lib.esnext.d.ts", "lib.dom.d.ts"],
        resolveJsonModule: true,
        skipLibCheck: true,
        strict: true,
        outDir: outputDir,
        allowJs: true,
      });
    });

    it("should return non-emitting config", () => {
      expect(createTypeScriptConfig({ emit: false })).toEqual({
        noEmit: true,
        declaration: true,
        emitDeclarationOnly: false,
        esModuleInterop: true,
        jsx: typescript.JsxEmit.React,
        lib: ["lib.esnext.d.ts", "lib.dom.d.ts"],
        resolveJsonModule: true,
        skipLibCheck: true,
        strict: true,
        outDir: outputDir,
        allowJs: true,
      });
    });
  });
});
