import chalk from "chalk";

declare global {
  // eslint-disable-next-line no-redeclare
  namespace jest {
    interface Matchers<R> {
      toContainInOrder(expected: string[]): R;
    }
  }
}

interface ContainsInOrderResult {
  hasPassed: boolean;
  failureMessage?: string;
}

const containsInOrder = (
  received: string[],
  expected: string[]
): ContainsInOrderResult => {
  let lastIndex = 0;
  const lastOccuranceMap: { [key: string]: number } = {};

  for (let e of expected) {
    const index = received.indexOf(e);

    // Not present at all
    if (index === -1) {
      return {
        hasPassed: false,
        failureMessage: `${chalk.red(`'${e}'`)} was not present.`,
      };
    }

    // Cater for previous occurences of the expected string
    const lastOccuredIndex = lastOccuranceMap[e];
    const adjustedIndex =
      lastOccuredIndex !== undefined
        ? received.indexOf(e, lastOccuredIndex + 1)
        : index;

    // Occurred out of order
    if (adjustedIndex < lastIndex) {
      return {
        hasPassed: false,
        failureMessage: `${chalk.red(`'${e}'`)} occurred out of order.`,
      };
    }

    // Update
    lastOccuranceMap[e] = adjustedIndex;
    lastIndex = adjustedIndex;
  }

  return {
    hasPassed: true,
  };
};

export const extendExpect = () => {
  expect.extend({
    toContainInOrder: (received: string[], expected: string[]) => {
      const recievedStr = chalk.red(JSON.stringify(received, null, 2));
      const expectedStr = chalk.green(JSON.stringify(expected, null, 2));

      const result = containsInOrder(received, expected);

      if (result.hasPassed) {
        return {
          message: () =>
            `expected:\n\n${recievedStr}\n\nto not contain in order:\n\n${expectedStr}\n\n${result.failureMessage}`,
          pass: result.hasPassed,
        };
      } else {
        return {
          message: () =>
            `expected:\n\n${recievedStr}\n\nto contain in order:\n\n${expectedStr}\n\n${result.failureMessage}`,
          pass: result.hasPassed,
        };
      }
    },
  });
};
