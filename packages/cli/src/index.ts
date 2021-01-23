import { createCli } from "./cli";

createCli()
  .run(process.argv.slice(2))
  .then((result) => process.exit(result.code))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
