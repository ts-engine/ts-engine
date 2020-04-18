export const createMessage = (name: string): Promise<string> => {
  return Promise.resolve(`Hello ${name}!`);
};
