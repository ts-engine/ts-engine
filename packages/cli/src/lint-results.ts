import { LintResult } from "eslint";

export const flattenLintResults = (
  nestedResults: LintResult[][]
): LintResult[] => {
  const results: LintResult[] = [];

  for (let result of nestedResults) {
    for (let nestedResult of result) {
      const existingResult = results.find(
        (r) => r.filePath === nestedResult.filePath
      );

      if (existingResult) {
        existingResult.messages.push(...nestedResult.messages);
        existingResult.errorCount += nestedResult.errorCount;
        existingResult.warningCount += nestedResult.warningCount;
        existingResult.fixableErrorCount += nestedResult.fixableErrorCount;
        existingResult.fixableWarningCount += nestedResult.fixableWarningCount;
      } else {
        results.push(nestedResult);
      }
    }
  }

  return results;
};

interface LintResultCounts {
  errorCount: number;
  fixableErrorCount: number;
  warningCount: number;
  fixableWarningCount: number;
}

export const getCounts = (results: LintResult[]): LintResultCounts => {
  return {
    errorCount: results.reduce((acc, next) => acc + next.errorCount, 0),
    warningCount: results.reduce((acc, next) => acc + next.warningCount, 0),
    fixableErrorCount: results.reduce(
      (acc, next) => acc + next.fixableErrorCount,
      0
    ),
    fixableWarningCount: results.reduce(
      (acc, next) => acc + next.fixableWarningCount,
      0
    ),
  };
};
