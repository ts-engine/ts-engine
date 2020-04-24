declare global {
  // eslint-disable-next-line no-redeclare
  namespace jest {
    interface Matchers<R> {
      toContainInOrder(expected: string[]): R;
    }
  }
}

export interface Option<TValue> {
  name: string;
  description: string;
  defaultValue?: TValue;
  isRequired: boolean;
  parse: (option: string) => TValue;
}

export interface DummyOption {
  name: string;
  description: string;
}

export interface Command<TOptions> {
  name: string;
  description: string;
  options: (Option<unknown> | DummyOption)[];
  run: (args: string[]) => Promise<void>;
}

export type OutputType = "node-app" | "library";

export interface RollupConfig {
  input: string;
  output: {
    file: string;
    format: string;
  }[];
  plugins: any[];
  external: string[];
}
