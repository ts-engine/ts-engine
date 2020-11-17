export interface BuildOptions {
  filepaths: string[];
  watch: boolean;
  typecheck: boolean;
  bundle: boolean;
  minify: boolean;
}

export const build = async (options: BuildOptions) => {};
