import { createMessage } from "../create-message";

describe("createMessage", () => {
  it("should create a message", () => {
    expect(createMessage("Lee")).toBe("Hello Lee!");
  });
});
