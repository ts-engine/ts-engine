import { createMessage } from "../create-message";

describe("createMessage", () => {
  it("should create a message", (async) => {
    expect(await createMessage("Lee")).toBe("Hello Lee!");
  });
});
