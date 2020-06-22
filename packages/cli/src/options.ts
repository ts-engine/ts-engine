interface YargsOption {
  type?: "string" | "number" | "boolean" | "array" | "count";
  default?: any;
  describe: string;
}

const createOption = (option: YargsOption): YargsOption => option;

export const options = {
  args: createOption({
    describe: "Capture args to forward",
  }),
  emit: createOption({
    type: "boolean",
    default: false,
    describe: "Emit type declarations",
  }),
  fix: createOption({
    type: "boolean",
    default: false,
    describe: "Fix fixable issues",
  }),
  "<jest_options>": createOption({
    describe: "Accepts all Jest arguments except config",
  }),
  library: createOption({
    type: "boolean",
    default: false,
    describe: "Build a library",
  }),
  name: createOption({
    type: "string",
    describe: "Package name",
  }),
  "node-app": createOption({
    type: "boolean",
    default: false,
    describe: "Build a Node.js application",
  }),
  minify: createOption({
    type: "boolean",
    default: false,
    describe: "Minify build output",
  }),
  "bundle-dependencies": createOption({
    type: "boolean",
    default: false,
    describe: "Bundle dependencies into build output",
  }),
  react: createOption({
    type: "boolean",
    default: false,
    describe: "Support react",
  }),
  typecheck: createOption({
    type: "boolean",
    default: false,
    describe: "Perform typechecking",
  }),
  watch: createOption({
    type: "boolean",
    default: false,
    describe: "Watch for changes",
  }),
};
