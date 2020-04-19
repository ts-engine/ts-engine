import { createMessage } from "./create-message";

const run = async () => {
  console.log(await createMessage("Lee"));
};

run();
