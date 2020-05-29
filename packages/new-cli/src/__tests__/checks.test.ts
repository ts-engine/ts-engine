import { checkBuildTypeOptions, checkNpmPackageName } from "../checks";

describe("checks", () => {
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
      }).toThrow("]]] is not a valid npm package name");
    });
    it("should accept valid npm package names", () => {
      expect(checkNpmPackageName({ name: "hello" })).toBe(true);
      expect(checkNpmPackageName({ name: "@hello/world" })).toBe(true);
    });
  });
});
