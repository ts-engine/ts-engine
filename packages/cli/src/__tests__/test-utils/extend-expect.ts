import chalk from "chalk";

const containsInOrder = (received: string[], expected: string[]) => {
  let lastIndex = 0;
  const lastOccuranceMap: { [key: string]: number } = {};

  for (let e of expected) {
    const index = received.indexOf(e);

    // Not present at all
    if (index === -1) {
      return false;
    }

    // Cater for previous occurences of the expected string
    const lastOccuredIndex = lastOccuranceMap[e];
    const adjustedIndex =
      lastOccuredIndex !== undefined
        ? received.indexOf(e, lastOccuredIndex + 1)
        : index;

    // Occurred out of order
    if (adjustedIndex < lastIndex) {
      return false;
    }

    // Update
    lastOccuranceMap[e] = adjustedIndex;
    lastIndex = adjustedIndex;
  }

  return true;
};

expect.extend({
  toContainInOrder: (received: string[], expected: string[]) => {
    const recievedStr = chalk.red(`[${received.join("', '")}]`);
    const expectedStr = chalk.green(`[${expected.join("', '")}]`);

    const pass = containsInOrder(received, expected);

    if (pass) {
      return {
        message: () =>
          `expected ${recievedStr} to not contain ${expectedStr} in order`,
        pass,
      };
    } else {
      return {
        message: () =>
          `expected ${recievedStr} to contain ${expectedStr} in order`,
        pass,
      };
    }
  },
});
