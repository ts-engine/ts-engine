# v2 plan

With v2 the aim is to make ts-engine even easier to consume and use whilst adding powerful new features like multiple outputs from a single build.

## shorten binary name

ts-engine can be cumbersome to type and people often forget the hyphen. Introducing multiple binary names would be handy, `ts-engine`, `tsengine` and `tse`.

## remove notion of library and node-app from the cli

ts-engine has the idea of building either a `library` or a `node-app`. This adds complexity because the user needs to pass the flag to cli commands like `build` and `new-package`. ts-engine should always provide babel/runtime via `@ts-engine/runtime@2` whether it is a library or a node app. When ts-engine runs, if `@ts-engine/runtime@2` is not present in packages dependencies then ts-engine should warn the user.

## support custom file and multiple file outputs

ts-engine currently only supports a single entry point that _must_ be `src/main.ts`. Whilst this does provide a great deal of certainty it is pretty annoying as you often have to have a separate `src/bootstrap.tsx` file that exports a bootstrapping function that the main file calls if you want your entry point to have JSX in it. This also makes it a little awkward to support multiple file inputs and outputs during a build. Another pain point is packages can't easily have multiple entry point files, for instance providing an additional file for test utilities, `import { something } from "my-lib/test-utils`.

A way to fix this is to provide the build files to the build command on the cli. This way multiple files can be provided and so multiple files can be built out for the package at the same time. As an example `tse build src/index.tsx src/test-utils.ts`.

## no longer starting a package, but running a file

In order to more easily support custom named file entry points for apps it makes sense to leave the `start` command behind and move to a `run` command. This switches things up so you're no longer starting a package, but running a file. It will perform much the same function with some slight cli tweaks. You will pass it a file and then any arguments passed after the file name will be passed to the script. This is the same format as Deno's run command. `tse run server.ts --port=3000`

## switch paradigm to typechecking by default

Many people have fed back that they always want to run typechecking no matter what. Whilst this isn't how I personally work, I can understand it. To that end, the `typecheck` command will be removed and all builds will perform typechecking and emit types by default. This removes the need for opt in flags on the build command and run command. Instead there should be a way to opt out of typechecking via a `skip-typecheck` flag or similar.

## less intrusive react support

Currently react support is provided via a CLI flag passed to commands. This is awkward and actually uneccasary and lots of people miss the fact you need to do that. ts-engine should detect whether react is a packages dependencies and if it is then should automatically apply the babel and eslint config. React dependencies should only every be added when react is detected as to include it by default without detection would potentially slow down compilation and linting but would also shut the door on easily supporting other JSX based libraries in the future.

## configuration

Currently babel, eslint and jest configuration is detected and is used in place of ts-engine's default configuration if found. ts-engine provides babel and eslint packages so you can extend from them when defining your own config if you just want to enhance the config, for example adding a single babel plugin for a library you are using. However currently 2 key pieces of configuration are _not_ configurable, `tsconfig.json` and `rollup.config.js`. Making rollup configuration configurable is likely to cause a number of headaches and severely break how ts-engine works... however allowing `tsconfig.json` to be configured seems reasonable.

## cli functionality

Create packages with templating support, gone are notions of library/node-app at create time.

```sh
# create a new package
> tse new my-lib

# create a new package from a template
> tse new my-react-library --from-template=react-library
```

Lint code.

```sh
# lint a file
> tse lint index.ts

# lint a directory
> tse lint src/

# apply fixes
> tse lint --fix src/
```

Test code, searches for `.test.tsx?` files

```sh
# test file
> tse test index.ts

# test directory
> tse test src/
```

Build package.

```sh
# build file and output typedefs
> tse build index.ts

# build multiple files to produce multiple outputs
> tse build index.ts test-utils.ts

# build in watch mode
> tse build --watch index.ts

# skip typecheck (will not emit types either)
> tse build --skip-typecheck index.ts
```

Run a package.

```sh
# build and run a file
> tse run index.ts

# build and run a file with inputs
> tse run index.ts --option-passed-to-app

# build and run in watch mode (watch flag has to appear before file as everything after the file is sent to the app)
> tse run --watch index.ts

# skip typechecking
> tse run --skip-typecheck index.ts
```

## exmple package.json

For an application:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "private": true,
  "script": {
    "build": "tse build src/index.ts",
    "lint": "tse lint src/",
    "run": "tse run src/index.ts"
  },
  "dependencies": {
    "@ts-engine/runtime": "2.0.0"
  },
  "devDependencies": {
    "@ts-engine/cli": "2.0.0"
  }
}
```

For a library:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "sideEffects": false,
  "script": {
    "build": "tse build src/index.ts src/test-utils.ts",
    "lint": "tse lint src/",
    "run": "tse run src/index.ts"
  },
  "dependencies": {
    "@ts-engine/runtime": "2.0.0"
  },
  "devDependencies": {
    "@ts-engine/cli": "2.0.0",
    "react": "latest"
  },
  "peerDependencies": {
    "react": "latest"
  }
}
```
