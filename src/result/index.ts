import { Mut, Ref } from "..";
import * as O from "../option";

interface Ok<T> {
  readonly _ok: true;
  content: Mut<T>;
}

interface Err<E> {
  readonly _ok: false;
  content: Mut<E>;
}

/** A plain object representation of a result. */
export type ResultObject<T, E> =
  | { ok: true; value: T }
  | { ok: false; value: E };

/** A successful value of type `T`. */
export const Ok = <T, E>(value: T) =>
  new Result<T, E>({ _ok: true, content: { value } });

/** An error of type `E`. */
export const Err = <T, E>(value: E) =>
  new Result<T, E>({ _ok: false, content: { value } });

/**
 * Monadic error handling.
 *
 * Type `Result` represents a success or error; every `Result` is either `Ok` and contains a value `T`, or `Err`, and contains an error `E`.
 * @throws All methods throw if the result has already been consumed.
 */
export class Result<T, E> {
  private inner?: Ok<T> | Err<E>;

  constructor(inner: Ok<T> | Err<E>) {
    this.inner = inner;
  }

  toString() {
    if (this.inner === undefined) {
      return "Undefined Result";
    }
    return this.inner._ok
      ? `Ok(${this.inner.content.value})`
      : `Err(${this.inner.content.value})`;
  }
}

/**
 * Returns `true` if the result is `Ok`.
 */
export function isOk<T, E>(self: Result<T, E>): boolean {
  assertDefined(self);
  return self["inner"]._ok;
}

/**
 * Returns `true` if the result is `Ok` and the value inside of it matches a predicate.
 */
export function isOkAnd<T, E>(
  f: (v: Ref<T>) => boolean,
): (self: Result<T, E>) => boolean {
  return function (self: Result<T, E>) {
    assertDefined(self);
    return self["inner"]._ok ? f(self["inner"].content) : false;
  };
}

/**
 * Returns `true` if the result is `Err`.
 */
export function isErr<T, E>(self: Result<T, E>): boolean {
  assertDefined(self);
  return !self["inner"]._ok;
}

/**
 * Returns `true` if the result is `Err` and the value inside of it matches a predicate.
 */
export function isErrAnd<T, E>(
  f: (v: Readonly<E>) => boolean,
): (self: Result<T, E>) => boolean {
  return function (self: Result<T, E>) {
    assertDefined(self);
    return self["inner"]._ok ? false : f(self["inner"].content.value as E);
  };
}

/**
 * Converts from `Result<T, E>` to `Option<T>`.
 *
 * Converts `this` into an `Option<T>`, consuming `this`, and discarding the error, if any.
 */
export function ok<T, E>(self: Result<T, E>): O.Option<T> {
  const r = drop(self);
  return r["inner"]._ok ? O.Some(r["inner"].content.value) : O.None();
}

/**
 * Converts from `Result<T, E>` to `Option<E>`.
 *
 * Converts `this` into an `Option<E>`, consuming `this`, and discarding the success value, if any.
 */
export function err<T, E>(self: Result<T, E>): O.Option<E> {
  const r = drop(self);
  return r["inner"]._ok ? O.None() : O.Some(r["inner"].content.value as E);
}

/**
 * Converts from `Result<T, E>` to `Result<Ref<T>, Ref<E>>`.
 */
export function asRef<T, E>(self: Result<T, E>): Result<Ref<T>, Ref<E>> {
  assertDefined(self);
  return new Result({
    _ok: self["inner"]._ok,
    content: { value: self["inner"].content as Ref<T> | Ref<E> },
  }) as Result<Ref<T>, Ref<E>>;
}

/**
 * Converts from `Result<T, E>` to `Result<Mut<T>, Mut<E>>`.
 */
export function asMut<T, E>(self: Result<T, E>): Result<Mut<T>, Mut<E>> {
  assertDefined(self);
  return new Result({
    _ok: self["inner"]._ok,
    content: { value: self["inner"].content },
  }) as Result<Mut<T>, Mut<E>>;
}

/**
 * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.
 *
 * This function can be used to compose the results of two functions.
 */
export function map<T, U>(
  f: (v: T) => U,
): <E>(self: Result<T, E>) => Result<U, E> {
  return function <E>(self: Result<T, E>) {
    const r = drop(self);
    return r["inner"]._ok == true
      ? Ok(f(r["inner"].content.value))
      : Err(r["inner"].content.value);
  };
}

/**
 * Returns the provided default (if `Err`), or applies a function to the contained value (if `Ok`).
 *
 * Arguments passed to `mapOr` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `mapOrElse`, which is lazily evaluated.
 */
export function mapOr<T, E, U>(
  d: U,
  f: (v: T) => U,
): (self: Result<T, E>) => U {
  return function (self: Result<T, E>) {
    const r = drop(self);
    return r["inner"]._ok ? f(r["inner"].content.value) : d;
  };
}

/**
 * Maps a `Result<T, E>` to `U` by applying fallback function `d` to a contained `Err` value, or function `f` to a contained `Ok` value.
 *
 * This function can be used to unpack a successful result while handling an error.
 */
export function mapOrElse<T, E, U>(
  d: (err: E) => U,
  f: (v: T) => U,
): (self: Result<T, E>) => U {
  return function (self: Result<T, E>) {
    const r = drop(self);
    return r["inner"]._ok
      ? f(r["inner"].content.value)
      : d(r["inner"].content.value as E);
  };
}

/**
 * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value, leaving an `Ok` value untouched.
 *
 * This function can be used to pass through a successful result while handling an error.
 */
export function mapErr<T, E, F>(
  f: (v: E) => F,
): (self: Result<T, E>) => Result<T, F> {
  return function (self: Result<T, E>) {
    const r = drop(self);
    return r["inner"]._ok == false
      ? Err(f(r["inner"].content.value))
      : Ok(r["inner"].content.value);
  };
}

/**
 * Calls a function with a reference to the contained value if `Ok`.
 *
 * Returns the original result.
 */
export function inspect<T, E>(
  f: (v: Ref<T>) => void,
): (self: Result<T, E>) => Result<T, E> {
  return function (self: Result<T, E>) {
    assertDefined(self);
    if (self["inner"]._ok) {
      void f(self["inner"].content);
    }
    return self;
  };
}

/**
 * Calls a function with a reference to the contained value if `Err`.
 *
 * Returns the original result.
 */
export function inspectErr<T, E>(
  f: (v: Ref<E>) => void,
): (self: Result<T, E>) => Result<T, E> {
  return function (self: Result<T, E>) {
    assertDefined(self);
    if (self["inner"]._ok === false) {
      void f(self["inner"].content);
    }
    return self;
  };
}

/**
 * Returns the contained `Ok` value.
 * @throws An `Error` with the passed message and the contents of `Err`.
 */
export function expect(msg: string): <T, E>(self: Result<T, E>) => T {
  return function <T, E>(self: Result<T, E>): T {
    const r = drop(self);
    if (r["inner"]._ok) {
      return r["inner"].content.value;
    }
    throw new Error(`${msg}: ${r["inner"].content.value}`);
  };
}

/**
 * Returns the contained `Ok` value.
 * @throws An `Error` with the contents of `Err`.
 */
export function unwrap<T, E>(self: Result<T, E>): T {
  const r = drop(self);
  if (r["inner"]._ok) {
    return r["inner"].content.value;
  }
  throw new Error(`${r["inner"].content.value}`);
}

/**
 * Returns the contained `Ok` value or a provided default.
 */
export function unwrapOr<T>(d: T): <E>(self: Result<T, E>) => T {
  return function <E>(self: Result<T, E>) {
    const r = drop(self);
    if (r["inner"]._ok) {
      return r["inner"].content.value;
    }
    return d;
  };
}

/**
 * Returns the contained `Ok` value or computes it from a closure.
 */
export function unwrapOrElse<T>(f: () => T): <E>(self: Result<T, E>) => T {
  return function <E>(self: Result<T, E>) {
    const r = drop(self);
    let value = null;
    if (r["inner"]._ok) {
      value = r["inner"].content.value;
    } else {
      value = f();
    }
    return value;
  };
}

/**
 * Returns the contained `Err` value.
 * @throws An `Error` with the passed message and the contents of `Ok`.
 */
export function expectErr(msg: string): <T, E>(self: Result<T, E>) => E {
  return function <T, E>(self: Result<T, E>): E {
    const r = drop(self);
    if (r["inner"]._ok === false) {
      return r["inner"].content.value;
    }
    throw new Error(`${msg}: ${r["inner"].content.value}`);
  };
}

/**
 * Returns the contained `Err` value.
 * @throws An `Error` with the contents of `Ok`.
 */
export function unwrapErr<T, E>(self: Result<T, E>): E {
  const r = drop(self);
  if (r["inner"]._ok === false) {
    return r["inner"].content.value;
  }
  throw new Error(`${r["inner"].content.value}`);
}

/**
 * Returns the contained `Ok` value, but does not check if it is `Err`.
 *
 * Since the error type is constrained to `never`, it can only be called on successful values.
 */
export function intoOk<T>(self: Result<T, never>): T {
  const r = drop(self);
  return (r["inner"] as Ok<T>).content.value;
}

/**
 * Returns the contained `Err` value, but does not check if it is`Ok`.
 *
 * Since the sucess type is constrained to `never`, it can only be called on error values.
 */
export function intoErr<E>(self: Result<never, E>): E {
  const r = drop(self);
  return (r["inner"] as Err<E>).content.value;
}

/**
 * Tests for shallow equality with another result.
 */
export function eq<T, E>(other: Result<T, E>): (self: Result<T, E>) => boolean {
  return function (self: Result<T, E>) {
    assertDefined(self);
    assertDefined(other);
    return self["inner"]._ok === other["inner"]._ok
      ? self["inner"].content.value === other["inner"].content.value
      : false;
  };
}

/**
 * Returns `res` if the result is `Ok`, otherwise returns the `Err` value of `self`.
 *
 * Arguments passed to `and` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `andThen`, which is lazily evaluated.
 */
export function and<U, E>(
  res: Result<U, E>,
): <T>(self: Result<T, E>) => Result<U, E> {
  return function <T>(self: Result<T, E>) {
    const r = drop(self);
    return r["inner"]._ok ? drop(res) : (r as unknown as Result<U, E>);
  };
}

/**
 * Calls `op` if the result is `Ok`, otherwise returns the `Err` value of `self`.
 *
 * This function can be used for control flow based on result values.
 */
export function andThen<T, E, U>(
  op: (v: T) => Result<U, E>,
): (self: Result<T, E>) => Result<U, E> {
  return function (self: Result<T, E>) {
    const r = drop(self);
    return r["inner"]._ok
      ? drop(op(r["inner"].content.value))
      : (r as unknown as Result<U, E>);
  };
}

/**
 * Returns `res` if the result is `Err`, otherwise returns the `Ok` value of `self`.
 *
 * Arguments passed to `or` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `orElse`, which is lazily evaluated.
 */
export function or<T, E>(
  res: Result<T, E>,
): (self: Result<T, E>) => Result<T, E> {
  return function (self: Result<T, E>) {
    const r = drop(self);
    return r["inner"]._ok ? r : drop(res);
  };
}

/**
 * Calls `op` if the result is `Err`, otherwise returns the `Ok` value of `self`.
 *
 * This function can be used for control flow based on result values.
 */
export function orElse<T, E>(
  op: (err: E) => Result<T, E>,
): (self: Result<T, E>) => Result<T, E> {
  return function (self: Result<T, E>) {
    const r = drop(self);
    return r["inner"]._ok ? r : drop(op(r["inner"].content.value as E));
  };
}

/**
 * Transposes a `Result` of an `Option` into an `Option` of a `Result`.
 *
 * `Ok(None)` will be mapped to `None`. `Ok(Some(_))` and `Err(_)` will be mapped to `Some(Ok(_))` and `Some(Err(_))`.
 */
export function transpose<T, E>(
  self: Result<O.Option<T>, E>,
): O.Option<Result<T, E>> {
  const r = drop(self);
  if (r["inner"]._ok === false) {
    return O.Some(Err(r["inner"].content.value));
  }
  const v = r["inner"].content.value;
  return O.map<T, Result<T, E>>((x) => Ok(x))(v);
}

/**
 * Converts from `Result<Result<T, E>, E>` to `Result<T, E>`.
 */
export function flatten<T, E>(self: Result<Result<T, E>, E>): Result<T, E> {
  const o = drop(self);
  return o["inner"]._ok ? drop(o["inner"].content.value) : (o as Result<T, E>);
}

/**
 * Converts a result to a plain object.
 */
export function toObject<T, E>(self: Result<T, E>): ResultObject<T, E> {
  const o = drop(self);
  return {
    ok: o["inner"]._ok,
    value: o["inner"].content.value,
  } as ResultObject<T, E>;
}

/**
 * Moves the value out of the result, leaving nothing behind.
 *
 * This is useful for preserving ownership, since it makes the old result unusable.
 */
export function drop<T, E>(self: Result<T, E>): Result<T, E> {
  assertDefined(self);
  const r = new Result(self["inner"]);
  self["inner"] = undefined;
  return r;
}

/**
 * Used to assert that the `Result` is not consumed.
 *
 * @throws Will throw if the inner value is undefined.
 */
function assertDefined<T, E>(self: Result<T, E>) {
  if (self["inner"] === undefined) {
    throw new Error("cannot use consumed result");
  }
}
