import * as R from "./result";

type Args<F extends Function> = F extends (...args: infer A) => any ? A : never;
type Returns<F extends Function> = F extends (...args: any) => infer A
  ? A
  : never;

/** Runs a function, catching any exceptions and returning a `Result` */
export function tryCatch<F extends Function>(
  f: F,
  ...args: Args<F>
): R.Result<Returns<F>, Error> {
  try {
    return R.Ok(f(args));
  } catch (error) {
    return R.Err(error);
  }
}
