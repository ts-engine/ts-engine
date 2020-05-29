import path from "path";
import fs from "fs-extra";
import mockFs from "mock-fs";
import { ConfigFactory } from "../config";

describe("config", () => {
  afterEach(() => {
    mockFs.restore();
  });

  describe("createBabelConfig", () => {
    it("should supply default babel config", () => {
      const configFactory = new ConfigFactory({ react: false });

      expect(configFactory.createBabelConfig()).toEqual({
        configFile: false,
        presets: ["@ts-engine/babel-preset"],
      });
    });

    it("should supply react babel config", () => {
      const configFactory = new ConfigFactory({ react: true });

      expect(configFactory.createBabelConfig()).toEqual({
        configFile: false,
        presets: ["@ts-engine/babel-preset-react", "@ts-engine/babel-preset"],
      });
    });

    it("should apply babel.config.js if found", () => {
      mockFs({
        "babel.config.js": "module.exports = {}",
      });
      const configFactory = new ConfigFactory({ react: true });

      expect(configFactory.createBabelConfig()).toEqual({
        configFile: path.resolve(process.cwd(), "babel.config.js"),
      });
    });
  });

  describe("createJestConfig", () => {
    afterEach(() => {
      if (fs.existsSync("jest.config.js")) {
        fs.removeSync("jest.config.js");
      }
    });

    it("should supply default jest config", () => {
      const configFactory = new ConfigFactory({ react: false });

      expect(configFactory.createJestConfig()).toEqual({
        testRegex: "src/.*.test.(js|jsx|ts|tsx)$",
        testURL: "http://localhost",
        transform: {
          ".(js|jsx|ts|tsx)$": [
            "babel-jest",
            configFactory.createBabelConfig(),
          ],
        },
      });
    });

    it("should merge jest.config.js if found", () => {
      fs.writeFileSync("jest.config.js", "module.exports = { coverage: 90}");
      const configFactory = new ConfigFactory({ react: false });

      expect(configFactory.createJestConfig()).toEqual({
        testRegex: "src/.*.test.(js|jsx|ts|tsx)$",
        testURL: "http://localhost",
        transform: {
          ".(js|jsx|ts|tsx)$": [
            "babel-jest",
            configFactory.createBabelConfig(),
          ],
        },
        coverage: 90,
      });
    });
  });
});
