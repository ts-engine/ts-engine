import { Context, NextFunction } from "@leecheneler/cli";

export const _test = () => async (ctx: Context, next: NextFunction) => {
  await next();
};
