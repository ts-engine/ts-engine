import { cli } from "../../cli";
import pkg from "../../../package.json";

console.log = jest.fn();

it("should print the version", async () => {
  cli({ args: ["--version"], exitProcess: false });

  expect(console.log).toHaveBeenCalledWith(pkg.version);
});
