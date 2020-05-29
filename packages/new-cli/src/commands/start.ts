interface StartOptions {
  args: string[];
  bundleDependencies: boolean;
  minify: boolean;
  react: boolean;
  watch: boolean;
}

export const start = (options: StartOptions) => {
  console.log(options);
};
