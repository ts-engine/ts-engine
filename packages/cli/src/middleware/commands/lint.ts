import { Context, NextFunction } from "@leecheneler/cli";

export const lint = () => async (ctx: Context, next: NextFunction) => {
  await next();
};
