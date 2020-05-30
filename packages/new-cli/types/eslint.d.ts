declare module "eslint" {
  export interface ESLintOptions {
    fix: boolean;
    baseConfig: string | any;
    cwd: string;
  }

  export interface LintResult {
    filePath: string;
    messages: LintMessage[];
    fixableErrorCount: number;
    fixableWarningCount: number;
    errorCount: number;
    warningCount: number;
    output: string | undefined;
    source: string | undefined;
    usedDeprecatedRules: DeprecatedRule[];
  }

  export interface LintMessage {
    ruleId: string;
    severity: 1 | 2;
    message: string;
    line: number;
    column: number;
    endLine: number | undefined;
    endColumn: number | undefined;
    fix: EditInfo | undefined;
    suggestions: Suggestion[] | undefined;
  }

  export interface EditInfo {
    range: [number, number];
    test: string;
  }

  export interface Suggestion {
    desc: string;
    fix: EditInfo;
  }

  export interface DeprecatedRule {
    ruleId: string;
    replacedBy: string[];
  }

  export interface LintTextOptions {
    filePath: string;
  }

  export class ESLint {
    constructor(options: ESLintOptions);
    lintFiles: (files: string[]) => Promise<LintResult[]>;
    lintText: (code: string, options: LintTextOptions) => Promise<LintResult[]>;
  }
}
