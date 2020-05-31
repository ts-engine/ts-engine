import { LintResult } from "eslint";
import { flattenLintResults, getCounts } from "../lint-results";

describe("lint-results", () => {
  const rawResults: LintResult[][] = [
    [
      {
        filePath: "src/a.ts",
        errorCount: 1,
        fixableErrorCount: 0,
        warningCount: 0,
        fixableWarningCount: 0,
        messages: [
          {
            message: "error",
            column: 1,
            endColumn: 1,
            endLine: 1,
            fix: { range: [1, 1], test: "1" },
            line: 1,
            ruleId: "1",
            severity: 1,
            suggestions: [{ desc: "", fix: { range: [0, 1], test: "1" } }],
          },
        ],
        output: "output",
        source: "source",
        usedDeprecatedRules: [],
      },
      {
        filePath: "src/a.ts",
        errorCount: 1,
        fixableErrorCount: 1,
        warningCount: 0,
        fixableWarningCount: 0,
        messages: [
          {
            message: "fixable error",
            column: 1,
            endColumn: 1,
            endLine: 1,
            fix: { range: [1, 1], test: "1" },
            line: 1,
            ruleId: "1",
            severity: 1,
            suggestions: [{ desc: "", fix: { range: [0, 1], test: "1" } }],
          },
        ],
        output: "output",
        source: "source",
        usedDeprecatedRules: [],
      },
    ],
    [
      {
        filePath: "src/b.ts",
        errorCount: 0,
        fixableErrorCount: 0,
        warningCount: 1,
        fixableWarningCount: 0,
        messages: [
          {
            message: "warning",
            column: 1,
            endColumn: 1,
            endLine: 1,
            fix: { range: [1, 1], test: "1" },
            line: 1,
            ruleId: "1",
            severity: 1,
            suggestions: [{ desc: "", fix: { range: [0, 1], test: "1" } }],
          },
        ],
        output: "output",
        source: "source",
        usedDeprecatedRules: [],
      },
      {
        filePath: "src/b.ts",
        errorCount: 0,
        fixableErrorCount: 0,
        warningCount: 1,
        fixableWarningCount: 1,
        messages: [
          {
            message: "fixable warning",
            column: 1,
            endColumn: 1,
            endLine: 1,
            fix: { range: [1, 1], test: "1" },
            line: 1,
            ruleId: "1",
            severity: 1,
            suggestions: [{ desc: "", fix: { range: [0, 1], test: "1" } }],
          },
        ],
        output: "output",
        source: "source",
        usedDeprecatedRules: [],
      },
    ],
  ];

  const flattenedResults = [
    {
      filePath: "src/a.ts",
      errorCount: 2,
      fixableErrorCount: 1,
      warningCount: 0,
      fixableWarningCount: 0,
      messages: [
        {
          message: "error",
          column: 1,
          endColumn: 1,
          endLine: 1,
          fix: { range: [1, 1], test: "1" },
          line: 1,
          ruleId: "1",
          severity: 1,
          suggestions: [{ desc: "", fix: { range: [0, 1], test: "1" } }],
        },
        {
          message: "fixable error",
          column: 1,
          endColumn: 1,
          endLine: 1,
          fix: { range: [1, 1], test: "1" },
          line: 1,
          ruleId: "1",
          severity: 1,
          suggestions: [{ desc: "", fix: { range: [0, 1], test: "1" } }],
        },
      ],
      output: "output",
      source: "source",
      usedDeprecatedRules: [],
    },
    {
      filePath: "src/b.ts",
      errorCount: 0,
      fixableErrorCount: 0,
      warningCount: 2,
      fixableWarningCount: 1,
      messages: [
        {
          message: "warning",
          column: 1,
          endColumn: 1,
          endLine: 1,
          fix: { range: [1, 1], test: "1" },
          line: 1,
          ruleId: "1",
          severity: 1,
          suggestions: [{ desc: "", fix: { range: [0, 1], test: "1" } }],
        },
        {
          message: "fixable warning",
          column: 1,
          endColumn: 1,
          endLine: 1,
          fix: { range: [1, 1], test: "1" },
          line: 1,
          ruleId: "1",
          severity: 1,
          suggestions: [{ desc: "", fix: { range: [0, 1], test: "1" } }],
        },
      ],
      output: "output",
      source: "source",
      usedDeprecatedRules: [],
    },
  ];

  describe("flattenLintResults", () => {
    it("should flatten lint results", () => {
      expect(flattenLintResults(rawResults)).toEqual(flattenedResults);
    });
  });

  describe("getCounts", () => {
    it("should return counts", () => {
      expect(getCounts(flattenedResults)).toEqual({
        errorCount: 2,
        fixableErrorCount: 1,
        warningCount: 2,
        fixableWarningCount: 1,
      });
    });
  });
});
