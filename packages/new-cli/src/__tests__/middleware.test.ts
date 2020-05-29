import { extractArgsOptionArgs, extractBuildType } from "../middleware";

describe("middleware", () => {
  describe("extractBuildType", () => {
    it("should set the build type", () => {
      expect(extractBuildType({ nodeApp: true })).toMatchObject({
        nodeApp: true,
        buildType: "node-app",
      });

      expect(extractBuildType({ library: true })).toMatchObject({
        library: true,
        buildType: "library",
      });
    });
  });

  describe("extractArgsOptionArgs", () => {
    const orginalArgv = process.argv;

    afterEach(() => {
      process.argv = orginalArgv;
    });

    it("should set args", () => {
      process.argv = ["ts-engine", "start", "--args", "--one", "-two", "three"];

      expect(extractArgsOptionArgs({})).toMatchObject({
        args: ["--one", "-two", "three"],
      });
    });

    it("should not set args", () => {
      process.argv = [
        "ts-engine",
        "start",
        "--not-args",
        "--one",
        "-two",
        "three",
      ];

      expect(extractArgsOptionArgs({})).toMatchObject({});
    });
  });
});
