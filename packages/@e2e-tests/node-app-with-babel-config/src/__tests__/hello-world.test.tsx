import { render } from "../hello-world";

it("should render hello world", () => {
  expect(render()).toBe("<span>hello world</span>");
});
