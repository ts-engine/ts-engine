it("should pass", () => {
  expect(1).toBe(1);
});

it("should pass async", async () => {
  const message = await new Promise((resolve) => {
    resolve("test");
  });

  expect(message).toBe("test");
});
