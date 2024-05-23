/**
 * Core functionality.
 * @module
 */

import { tryCatch } from "./exception";
import * as R from "./result";

/** An immutable reference. */
export interface Ref<T> {
  readonly value: T;
}

/** A mutable reference. */
export interface Mut<T> {
  value: T;
}

/** An empty function. */
export const empty = () => {};

/** An identity function. */
export const identity = <T>(x: T) => x;

/** Performs a structured clone of an object, catching any `DataCloneError`s. */
export function clone(
  options?: StructuredSerializeOptions,
): <T>(value: T) => R.Result<T, DOMException> {
  return function <T>(value: T): R.Result<T, DOMException> {
    return tryCatch(() => structuredClone(value, options)) as R.Result<
      T,
      DOMException
    >;
  };
}
