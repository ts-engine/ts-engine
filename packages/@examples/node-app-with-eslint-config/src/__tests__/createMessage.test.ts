import { createMessage } from "../createMessage";

describe("createMessage", () => {
  it("should create a message", () => {
    expect(createMessage("Lee")).toBe("Hello Lee!");
  });
});
