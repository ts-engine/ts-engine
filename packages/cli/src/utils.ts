export const getSupportedExtensions = (options: { dots: boolean }) => {
  return ["js", "ts", "jsx", "tsx", "mjs", "cjs", "es6"].map((e) =>
    options.dots ? `.${e}` : e
  );
};
