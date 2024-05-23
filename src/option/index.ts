import { AssertionError } from "assert";
import { Mut, Ref } from "..";
import * as R from "../result";
import { chain } from "..";

interface Some<T> {
  readonly _some: true;
  content: Mut<T>;
}

interface None {
  readonly _some: false;
}

const UNWRAP_MSG = "could not unwrap `None` value";

/** A plain object representation of an option. */
export type OptionObject<T> =
  | { some: true; value: T }
  | { some: false; value: null };

/** Some value of type `T`. */
export const Some = <T>(value: T) =>
  new Option<T>({ _some: true, content: { value } });

/** No value. */
export const None = <T>() => new Option<T>({ _some: false });

/**
 * Optional values.
 *
 * Type `Option` represents an optional value: every `Option` is either `Some` and contains a value, or `None`, and does not.
 * @throws All methods throw if the option has already been consumed.
 */
export class Option<T> {
  private inner?: Some<T> | None;

  constructor(inner: Some<T> | None) {
    this.inner = inner;
  }

  toString() {
    if (this.inner === undefined) {
      return "Undefined Option";
    }
    return this.inner._some ? `Some(${this.inner.content.value})` : "None";
  }
}

/**
 * Returns `true` if the option is a `Some` value.
 */
export function isSome<T>(self: Option<T>): boolean {
  assertDefined(self);
  return self["inner"]._some;
}

/**
 * Returns `true` if the option is a `Some` and the value inside of it matches a predicate.
 */
export function isSomeAnd<T>(
  f: (v: Ref<T>) => boolean,
): (self: Option<T>) => boolean {
  return function (self: Option<T>): boolean {
    assertDefined(self);
    return self["inner"]._some ? f(self["inner"].content) : false;
  };
}

/**
 * Returns `true` if the option is a `None` value.
 */
export function isNone<T>(self: Option<T>): boolean {
  assertDefined(self);
  return !self["inner"]._some;
}

/**
 * Converts from `Option<T>` to `Option<Ref<T>>`.
 */
export function asRef<T>(self: Option<T>): Option<Ref<T>> {
  assertDefined(self);
  return self["inner"]._some ? Some(self["inner"].content) : None();
}

/**
 * Converts from `Option<T>` to `Option<Mut<T>>`.
 */
export function asMut<T>(self: Option<T>): Option<Mut<T>> {
  assertDefined(self);
  return self["inner"]._some ? Some(self["inner"].content) : None();
}

/**
 * Returns an array of the contained value, if any. If this is `None`, an empty array is returned.
 * This can be useful to have a single type of iterator over an `Option` or slice.
 */
export function asArray<T>(self: Option<T>): Ref<T>[] {
  assertDefined(self);
  return self["inner"]._some ? [self["inner"].content] : [];
}

/**
 * Returns an array of the contained value, if any. If this is `None`, an empty array is returned.
 * This can be useful to have a single type of iterator over an `Option` or slice.
 */
export function toArray<T>(self: Option<T>): T[] {
  const o = drop(self);
  return o["inner"]._some ? [o["inner"].content.value] : [];
}

/**
 * Returns the contained `Some` value.
 * @throws An `Error` with the passed message.
 */
export function expect(msg: string): <T>(self: Option<T>) => T {
  return function <T>(self: Option<T>): T {
    const o = drop(self);
    if (o["inner"]._some) {
      return o["inner"].content.value;
    }
    throw new Error(msg);
  };
}

/**
 * Returns the contained `Some` value.
 * @throws An `Error` with a generic message.
 */
export function unwrap<T>(self: Option<T>): T {
  const o = drop(self);
  if (o["inner"]._some) {
    return o["inner"].content.value;
  }
  throw new Error(UNWRAP_MSG);
}

/**
 * Returns the contained `Some` value or a provided default.
 */
export function unwrapOr<T>(d: T): (self: Option<T>) => T {
  return function (self: Option<T>) {
    const o = drop(self);
    if (o["inner"]._some) {
      return o["inner"].content.value;
    }
    return d;
  };
}

/**
 * Returns the contained `Some` value or computes it from a closure.
 */
export function unwrapOrElse<T>(f: () => T): (self: Option<T>) => T {
  return function (self: Option<T>) {
    const o = drop(self);
    let value = null;
    if (o["inner"]._some) {
      value = o["inner"].content.value;
    } else {
      value = f();
    }
    return value;
  };
}

/**
 * Tests for shallow equality with another option.
 */
export function eq<T>(other: Option<T>): (self: Option<T>) => boolean {
  return function (self: Option<T>) {
    assertDefined(self);
    assertDefined(other);
    return self["inner"]._some && other["inner"]._some
      ? self["inner"].content.value === other["inner"].content.value
      : !self["inner"]._some && !other["inner"]._some;
  };
}

/**
 * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value (if `Some`) or returns `None` (if `None`).
 */
export function map<T, U>(f: (v: T) => U): (self: Option<T>) => Option<U> {
  return function (self: Option<T>) {
    const o = drop(self);
    return o["inner"]._some ? Some(f(o["inner"].content.value)) : None();
  };
}

/**
 * Calls a function with a reference to the contained value if `Some`.
 *
 * Returns the original option.
 */
export function inspect<T>(
  f: (v: Ref<T>) => void,
): (self: Option<T>) => Option<T> {
  return function (self: Option<T>) {
    assertDefined(self);
    if (self["inner"]._some) {
      void f(self["inner"].content);
    }
    return self;
  };
}

/**
 * Returns the provided default result (if none), or applies a function to the contained value (if any).
 *
 * Arguments passed to `mapOr` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `mapOrElse`, which is lazily evaluated.
 */
export function mapOr<T, U>(d: U, f: (v: T) => U): (self: Option<T>) => U {
  return function (self: Option<T>): U {
    const o = drop(self);
    return o["inner"]._some ? f(o["inner"].content.value) : d;
  };
}

/**
 * Computes a default function result (if none), or applies a different function to the contained value (if any).
 */
export function mapOrElse<T, U>(
  d: () => U,
  f: (v: T) => U,
): (self: Option<T>) => U {
  return function (self: Option<T>) {
    const o = drop(self);
    return o["inner"]._some ? f(o["inner"].content.value) : d();
  };
}

/**
 * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.
 *
 * Arguments passed to `okOr` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `okOrElse`, which is lazily evaluated.
 */
export function okOr<T, E>(err: E): (self: Option<T>) => R.Result<T, E> {
  return function (self: Option<T>) {
    const o = drop(self);
    if (o["inner"]._some) {
      return R.Ok(o["inner"].content.value);
    } else {
      return R.Err(err);
    }
  };
}

/**
 * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err())`.
 */
export function okOrElse<T, E>(
  err: () => E,
): (self: Option<T>) => R.Result<T, E> {
  return function (self: Option<T>) {
    const o = drop(self);
    if (o["inner"]._some) {
      return R.Ok(o["inner"].content.value);
    } else {
      return R.Err(err());
    }
  };
}

/**
 * Returns `None` if the option is `None`, otherwise returns `optb`.
 *
 * Arguments passed to `and` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `andThen`, which is lazily evaluated.
 */
export function and<T, U>(optb: Option<U>): (self: Option<T>) => Option<U> {
  return function (self: Option<T>) {
    const o = drop(self);
    return o["inner"]._some ? drop(optb) : (o as unknown as Option<U>);
  };
}

/**
 * Returns `None` if the option is `None`, otherwise calls `f` with the wrapped value and returns the result.
 */
export function andThen<T, U>(
  f: (v: T) => Option<U>,
): (self: Option<T>) => Option<U> {
  return function (self: Option<T>) {
    const o = drop(self);
    return o["inner"]._some
      ? drop(f(o["inner"].content.value))
      : (o as unknown as Option<U>);
  };
}

/**
 * Returns None if the option is None, otherwise calls predicate with the wrapped value and returns:
 * - Some(t) if predicate returns true (where t is the wrapped value), and
 * - None if predicate returns false.
 */
export function filter<T>(
  predicate: (v: Ref<T>) => boolean,
): (self: Option<T>) => Option<T> {
  return function (self: Option<T>) {
    const o = drop(self);
    return o["inner"]._some
      ? predicate(o["inner"].content)
        ? o
        : None()
      : None();
  };
}

/**
 * Returns the option if it contains a value, otherwise returns `optb`.
 *
 * Arguments passed to `or` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `orElse`, which is lazily evaluated.
 */
export function or<T>(optb: Option<T>): (self: Option<T>) => Option<T> {
  return function (self: Option<T>) {
    const o = drop(self);
    return o["inner"]._some ? o : drop(optb);
  };
}

/**
 * Returns the option if it contains a value, otherwise calls `f` and returns the result.
 */
export function orElse<T>(f: () => Option<T>): (self: Option<T>) => Option<T> {
  return function (self: Option<T>) {
    const o = drop(self);
    return o["inner"]._some ? o : drop(f());
  };
}

/**
 * Returns `Some` if exactly one of the options is `Some`, otherwise returns `None`.
 */
export function xor<T>(optb: Option<T>): (self: Option<T>) => Option<T> {
  return function (self: Option<T>) {
    const o = drop(self);
    const p = drop(optb);
    return o["inner"]._some !== p["inner"]._some
      ? o["inner"]._some
        ? o
        : p
      : None();
  };
}

/**
 * Inserts value into the option, then returns a mutable reference to it.
 *
 * If the option already contains a value, the old value is dropped.
 *
 * See also `getOrInsert`, which doesn’t update the value if the option already contains `Some`.
 */
export function insert<T>(value: T): (self: Option<T>) => Mut<T> {
  return function (self: Option<T>) {
    assertDefined(self);
    self["inner"] = { _some: true, content: { value } };
    return self["inner"].content;
  };
}

/**
 * Inserts value into the option if it is `None`, then returns a mutable reference to the contained value.
 *
 * See also `insert`, which updates the value even if the option already contains `Some`.
 */
export function getOrInsert<T>(value: T): (self: Option<T>) => Mut<T> {
  return function (self: Option<T>) {
    assertDefined(self);
    if (!self["inner"]._some) {
      self["inner"] = { _some: true, content: { value } };
    }
    return self["inner"].content;
  };
}

/**
 * Inserts a value computed from `f` into the option if it is `None`, then returns a mutable reference to the contained value.
 */
export function getOrInsertWith<T>(f: () => T): (self: Option<T>) => Mut<T> {
  return function (self: Option<T>) {
    assertDefined(self);
    if (!self["inner"]._some) {
      self["inner"] = { _some: true, content: { value: f() } };
    }
    return self["inner"].content;
  };
}

/**
 * Takes the value out of the option, leaving a `None` in its place.
 */
export function take<T>(self: Option<T>): Option<T> {
  assertDefined(self);
  const o = new Option(self["inner"]);
  self["inner"] = { _some: false };
  return o;
}

/**
 * Takes the value out of the option, but only if the predicate evaluates to `true` on a mutable reference to the value.
 *
 * In other words, replaces self with `None` if the predicate returns `true`. This method operates similar to `take` but conditional.
 */
export function takeIf<T>(
  predicate: (v: Mut<T>) => boolean,
): (self: Option<T>) => Option<T> {
  return function (self: Option<T>) {
    assertDefined(self);
    return chain(self)(asMut)(mapOr(false, (v) => predicate(v))).end()
      ? take(self)
      : None();
  };
}

/**
 * Replaces the actual value in the option by the value given in parameter,
 * returning the old value if present, leaving a `Some` in its place without deinitializing either one.
 */
export function replace<T>(value: T): (self: Option<T>) => Option<T> {
  return function (self: Option<T>) {
    assertDefined(self);
    const o = new Option(self["inner"]);
    self["inner"] = { _some: true, content: { value } };
    return o;
  };
}

/**
 * Zips `this` with another `Option`.
 *
 * If `this` is `Some(s)` and other is `Some(o)`, this method returns `Some([s, o])`. Otherwise, `None` is returned.
 */
export function zip<T, U>(
  other: Option<U>,
): (self: Option<T>) => Option<[T, U]> {
  return function (self: Option<T>) {
    assertDefined(self);
    assertDefined(other);
    if (!self["inner"]._some || !other["inner"]._some) {
      self["inner"] = other["inner"] = undefined;
      return None();
    }
    const t = self["inner"].content.value;
    const u = other["inner"].content.value;
    self["inner"] = other["inner"] = undefined;
    return Some([t, u]);
  };
}

/**
 * Zips `this` and another Option with function `f`.
 *
 * If `this` is `Some(s)` and other is `Some(o)`, this method returns `Some(f(s, o))`. Otherwise, `None` is returned.
 */
export function zipWith<T, U, R>(
  other: Option<U>,
  f: (a: T, b: U) => R,
): (self: Option<T>) => Option<R> {
  return function (self: Option<T>) {
    assertDefined(self);
    assertDefined(other);
    if (!self["inner"]._some || !other["inner"]._some) {
      self["inner"] = other["inner"] = undefined;
      return None();
    }
    const t = self["inner"].content.value;
    const u = other["inner"].content.value;
    self["inner"] = other["inner"] = undefined;
    return Some(f(t, u));
  };
}

/**
 * Unzips an option containing a tuple of two options.
 *
 * If `this` is `Some([a, b])` this method returns `(Some(a), Some(b))`. Otherwise, `(None, None)` is returned.
 */
export function unzip<A, B>(self: Option<[A, B]>): [Option<A>, Option<B>] {
  const o = drop(self);
  if (!o["inner"]._some) {
    return [None(), None()];
  }
  const [a, b] = o["inner"].content.value;
  return [Some(a), Some(b)];
}

/**
 * Transposes an `Option` of a `Result` into a `Result` of an `Option`.
 *
 * `None` will be mapped to `Ok(None)`. `Some(Ok(_))` and `Some(Err(_))` will be mapped to `Ok(Some(_))` and `Err(_)`.
 */
export function transpose<T, E>(
  self: Option<R.Result<T, E>>,
): R.Result<Option<T>, E> {
  const o = drop(self);
  if (o["inner"]._some === false) {
    return R.Ok(None());
  }
  const v = o["inner"].content.value;
  return R.map<T, Option<T>>((x) => Some(x))(v);
}

/**
 * Converts from `Option<Option<T>>` to `Option<T>`.
 */
export function flatten<T>(self: Option<Option<T>>): Option<T> {
  const o = drop(self);
  return o["inner"]._some ? drop(o["inner"].content.value) : (o as Option<T>);
}

/**
 * Converts an option to a plain object.
 */
export function toObject<T>(self: Option<T>): OptionObject<T> {
  const o = drop(self);
  return {
    some: o["inner"]._some,
    value: (o["inner"] as Some<T>).content?.value ?? null,
  } as OptionObject<T>;
}

/**
 * Moves the value out of the option, leaving nothing behind.
 *
 * This is useful for preserving ownership, since it makes the old option unusable.
 */
export function drop<T>(self: Option<T>): Option<T> {
  assertDefined(self);
  const o = new Option(self["inner"]);
  self["inner"] = undefined;
  return o as Option<T>;
}

/**
 * Used to assert that the `Option` is not consumed.
 *
 * @throws Will throw if the inner value is undefined.
 */
export function assertDefined<T>(self: Option<T>) {
  if (self["inner"] === undefined) {
    throw new AssertionError({ message: "cannot use consumed option" });
  }
}
