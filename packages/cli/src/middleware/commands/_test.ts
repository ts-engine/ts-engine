import { Context, NextFunction } from "@leecheneler/cli";

export const test = () => async (ctx: Context, next: NextFunction) => {
  await next();
};
