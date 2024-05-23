import { Mut } from "./core";

export interface Chain<T> {
  /** Continue the chain. */
  <R>(f: (v: T) => R): Chain<R>;
  /** Ends the chain, returning the contained value. */
  end(): T;
}

/**
 * Begins a chain of unary operations on a contained value.
 *
 * This is an alternative to method chaining, since tree-shaking does not work with methods as of writing.
 */
export function chain<T>(value: T): Chain<T> {
  const state: Mut<T> = {
    value,
  };
  function c<R>(f: (v: T) => R): Chain<R> {
    return chain(f(state.value));
  }
  c.end = () => state.value;
  return c;
}
