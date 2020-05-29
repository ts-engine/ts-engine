interface LintOptions {
  fix: boolean;
  react: boolean;
}

export const lint = (options: LintOptions) => {
  console.log(options);
};
