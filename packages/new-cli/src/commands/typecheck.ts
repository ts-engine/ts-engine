interface TypecheckOptions {
  emit: boolean;
}

export const typecheck = (options: TypecheckOptions) => {
  console.log(options);
};
