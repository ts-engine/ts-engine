import path from "path";
import builtInModules from "builtin-modules";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import { preserveShebangs } from "rollup-plugin-preserve-shebangs";

module.exports = {
  input: "./src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [
    preserveShebangs(),
    json(),
    resolve({
      extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
      preferBuiltins: true,
    }),
    babel({
      exclude: "node_modules/**",
      extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
      babelHelpers: "runtime",
      presets: ["@ts-engine/babel-preset"],
    }),
    commonjs(),
    terser(),
  ],
  external: (id) => {
    return (
      builtInModules.includes(id) ||
      (!id.startsWith(".") && !path.isAbsolute(id))
    );
  },
};
