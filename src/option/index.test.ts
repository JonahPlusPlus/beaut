import * as O from ".";
import * as R from "../result";
import { chain } from "..";

test("option kind testers", () => {
  // isSome and isNone
  const n = O.None();
  expect(O.isNone(n)).toBe(true);
  expect(O.isSome(n)).toBe(false);
  const s = O.Some(2);
  expect(O.isSome(s)).toBe(true);
  expect(O.isNone(s)).toBe(false);

  // isSomeAnd
  expect(chain(s)(O.isSomeAnd((x) => x.value > 1)).end()).toBe(true);
  expect(chain(s)(O.isSomeAnd((x) => x.value > 3)).end()).toBe(false);
});

test("unwrap none", () => {
  const n = O.None();
  expect(() => O.unwrap(n)).toThrow();
});

test("expect none", () => {
  const n = O.None();
  expect(() => chain(n)(O.expect("bad")).end()).toThrow("bad");
});

test("unwrap some", () => {
  const s = O.Some(2);
  expect(O.unwrap(s)).toBe(2);
  expect(() => O.take(s)).toThrow();
});

test("expect some", () => {
  const s = O.Some(2);
  let v = O.expect("bad")(s);
  expect(v).toBe(2);
  expect(() => O.take(s)).toThrow();
});

test("unwrapOr none", () => {
  const n: O.Option<number> = O.None();
  expect(chain(n)(O.unwrapOr(3)).end()).toBe(3);
  expect(() => O.take(n)).toThrow();
});

test("unwrapOr some", () => {
  const s = O.Some(2);
  expect(chain(s)(O.unwrapOr(3)).end()).toBe(2);
  expect(() => O.take(s)).toThrow();
});

test("unwrapOrElse none", () => {
  const n: O.Option<number> = O.None();
  expect(chain(n)(O.unwrapOrElse(() => 3)).end()).toBe(3);
  expect(() => O.take(n)).toThrow();
});

test("unwrapOrElse some", () => {
  const s = O.Some(2);
  expect(chain(s)(O.unwrapOrElse(() => 3)).end()).toBe(2);
  expect(() => O.take(s)).toThrow();
});

test("eq true", () => {
  const a = O.Some(2);
  const b = O.Some(2);
  expect(chain(a)(O.eq(b)).end()).toBe(true);
  expect(() => O.take(a)).not.toThrow();
  expect(() => O.take(b)).not.toThrow();
});

test("eq false", () => {
  const a = O.Some(2);
  const b = O.Some(3);
  expect(chain(a)(O.eq(b)).end()).toBe(false);
  expect(() => O.take(a)).not.toThrow();
  expect(() => O.take(b)).not.toThrow();
});

test("map", () => {
  const s = O.Some({ v: 2 });
  const t = chain(s)(
    O.map((r) => {
      r.v *= 4;
      return r;
    }),
  ).end();
  expect(() => O.take(s)).toThrow();
  expect(O.unwrap(t).v).toBe(8);
});

test("inspect", () => {
  const s = O.Some(2);
  const f = jest.fn();
  chain(s)(O.inspect((x) => f(x.value))).end();
  expect(f).toHaveBeenCalledWith(2);
});

test("mapOr none", () => {
  const n = O.None<number>();
  expect(chain(n)(O.mapOr(2, (x) => x * 3)).end()).toBe(2);
});

test("mapOr some", () => {
  const n = O.Some(3);
  expect(chain(n)(O.mapOr(2, (x) => x * 3)).end()).toBe(9);
});

test("mapOrElse none", () => {
  const n = O.None<number>();
  expect(
    chain(n)(
      O.mapOrElse(
        () => 2,
        (x) => x * 3,
      ),
    ).end(),
  ).toBe(2);
});

test("mapOrElse some", () => {
  const n = O.Some(3);
  expect(
    chain(n)(
      O.mapOrElse(
        () => 2,
        (x) => x * 3,
      ),
    ).end(),
  ).toBe(9);
});

test("okOr none", () => {
  const n = O.None<number>();
  expect(chain(n)(O.okOr("foo")).end()).toStrictEqual(R.Err("foo"));
});

test("okOr some", () => {
  const s = O.Some(2);
  expect(chain(s)(O.okOr("foo")).end()).toStrictEqual(R.Ok(2));
});

test("okOrElse none", () => {
  const n = O.None<number>();
  expect(chain(n)(O.okOrElse(() => "foo")).end()).toStrictEqual(R.Err("foo"));
});

test("okOrElse some", () => {
  const s = O.Some(2);
  expect(chain(s)(O.okOrElse(() => "foo")).end()).toStrictEqual(R.Ok(2));
});

test("and none", () => {
  expect(chain(O.None())(O.and(O.None())).end()).toStrictEqual(O.None());
  expect(chain(O.None())(O.and(O.Some(2))).end()).toStrictEqual(O.None());
  expect(chain(O.Some(2))(O.and(O.None())).end()).toStrictEqual(O.None());
});

test("and some", () => {
  expect(chain(O.Some(1))(O.and(O.Some(2))).end()).toStrictEqual(O.Some(2));
});

test("andThen none", () => {
  expect(
    chain(O.None<number>())(O.andThen((_) => O.None())).end(),
  ).toStrictEqual(O.None());
  expect(
    chain(O.None<number>())(O.andThen((v) => O.Some(2 + v))).end(),
  ).toStrictEqual(O.None());
  expect(chain(O.Some(2))(O.andThen((_) => O.None())).end()).toStrictEqual(
    O.None(),
  );
});

test("andThen some", () => {
  expect(chain(O.Some(1))(O.andThen((v) => O.Some(2 + v))).end()).toStrictEqual(
    O.Some(3),
  );
});

test("filter", () => {
  expect(chain(O.Some(2))(O.filter((x) => x.value > 1)).end()).toStrictEqual(
    O.Some(2),
  );
  expect(chain(O.Some(2))(O.filter((x) => x.value < 1)).end()).toStrictEqual(
    O.None(),
  );
});

test("or none", () => {
  expect(chain(O.None())(O.or(O.None())).end()).toStrictEqual(O.None());
});

test("or some", () => {
  expect(chain(O.None<number>())(O.or(O.Some(2))).end()).toStrictEqual(
    O.Some(2),
  );
  expect(chain(O.Some(2))(O.or(O.None())).end()).toStrictEqual(O.Some(2));
  expect(chain(O.Some(1))(O.or(O.Some(2))).end()).toStrictEqual(O.Some(1));
});

test("orElse none", () => {
  expect(chain(O.None())(O.orElse(() => O.None())).end()).toStrictEqual(
    O.None(),
  );
});

test("orElse some", () => {
  expect(
    chain(O.None<number>())(O.orElse(() => O.Some(2))).end(),
  ).toStrictEqual(O.Some(2));
  expect(chain(O.Some(2))(O.orElse(() => O.None())).end()).toStrictEqual(
    O.Some(2),
  );
  expect(chain(O.Some(1))(O.orElse(() => O.Some(2))).end()).toStrictEqual(
    O.Some(1),
  );
});

test("xor", () => {
  expect(chain(O.None<number>())(O.xor(O.Some(2))).end()).toStrictEqual(
    O.Some(2),
  );
  expect(chain(O.None<number>())(O.xor(O.None())).end()).toStrictEqual(
    O.None(),
  );
  expect(chain(O.Some(1))(O.xor(O.Some(2))).end()).toStrictEqual(O.None());
});

test("insert", () => {
  const o = O.Some(2);
  expect(o).toStrictEqual(O.Some(2));
  const a = chain(o)(O.insert(3)).end();
  expect(o).toStrictEqual(O.Some(3));
  expect(a.value).toBe(3);
  a.value = 4;
  expect(o).toStrictEqual(O.Some(4));
});

test("getOrInsert", () => {
  const o = O.None<number>();
  expect(o).toStrictEqual(O.None());
  const a = chain(o)(O.getOrInsert(3)).end();
  expect(o).toStrictEqual(O.Some(3));
  expect(a.value).toBe(3);
  a.value = 4;
  expect(o).toStrictEqual(O.Some(4));
});

test("getOrInsertWith", () => {
  const o = O.None<number>();
  expect(o).toStrictEqual(O.None());
  const a = chain(o)(O.getOrInsertWith(() => 3)).end();
  expect(o).toStrictEqual(O.Some(3));
  expect(a.value).toBe(3);
  a.value = 4;
  expect(o).toStrictEqual(O.Some(4));
});

test("take none", () => {
  const o = O.None<number>();
  const p = O.take(o);
  expect(o).toStrictEqual(O.None());
  expect(p).toStrictEqual(O.None());
});

test("take some", () => {
  const o = O.Some(4);
  const p = O.take(o);
  expect(o).toStrictEqual(O.None());
  expect(p).toStrictEqual(O.Some(4));
});

test("takeIf none", () => {
  const o = O.None<number>();
  const p = O.takeIf<number>((x) => x.value > 2)(o);
  expect(o).toStrictEqual(O.None());
  expect(p).toStrictEqual(O.None());
});

test("takeIf some", () => {
  const o = O.Some(4);
  const p = O.takeIf<number>((x) => x.value > 2)(o);
  expect(o).toStrictEqual(O.None());
  expect(p).toStrictEqual(O.Some(4));
});

test("replace none", () => {
  const o = O.None<number>();
  const v = O.replace(2)(o);
  expect(o).toStrictEqual(O.Some(2));
  expect(v).toStrictEqual(O.None());
});

test("replace some", () => {
  const o = O.Some(4);
  const v = O.replace(2)(o);
  expect(o).toStrictEqual(O.Some(2));
  expect(v).toStrictEqual(O.Some(4));
});

test("zip", () => {
  const a = O.Some(2);
  const b = O.Some("hello");
  const zipped = chain(a)(O.zip(b)).end();
  expect(zipped).toStrictEqual(O.Some([2, "hello"]));
  const c = O.Some(2);
  const d = O.None();
  const zipped2 = chain(c)(O.zip(d)).end();
  expect(zipped2).toStrictEqual(O.None());
});

test("zipWith", () => {
  const a = O.Some(2);
  const b = O.Some("hello");
  const zipped = chain(a)(O.zipWith(b, (o, p) => p + o)).end();
  expect(zipped).toStrictEqual(O.Some("hello2"));
  const c = O.Some(2);
  const d = O.None<string>();
  const zipped2 = chain(c)(O.zipWith(d, (o, p) => p + o)).end();
  expect(zipped2).toStrictEqual(O.None());
});

test("unzip", () => {
  const o = O.Some<[string, number]>(["foo", 3]);
  const [a, b] = O.unzip(o);
  expect(a).toStrictEqual(O.Some("foo"));
  expect(b).toStrictEqual(O.Some(3));
});

test("transpose ok", () => {
  const or = O.Some(R.Ok(3));
  const ro = O.transpose(or);
  expect(ro).toStrictEqual(R.Ok(O.Some(3)));
});

test("transpose err", () => {
  const or = O.Some(R.Err("error"));
  const ro = O.transpose(or);
  expect(ro).toStrictEqual(R.Err("error"));
});

test("transpose none", () => {
  const or = O.None<R.Result<number, string>>();
  const ro = O.transpose(or);
  expect(ro).toStrictEqual(R.Ok(O.None()));
});

test("flatten", () => {
  const oo = O.Some(O.Some(2));
  const o = O.flatten(oo);
  expect(o).toStrictEqual(O.Some(2));
});

test("toObject", () => {
  const s = O.Some(3);
  expect(O.toObject(s)).toStrictEqual({ some: true, value: 3 });
  const n = O.None();
  expect(O.toObject(n)).toStrictEqual({ some: false, value: null });
});

test("switch-case some", () => {
  const s = O.Some(2);
  const o = O.toObject(s);
  let a = 0;
  switch (o.some) {
    case true:
      a = o.value;
      break;
    case false:
      a = 100;
      break;
  }
  expect(a).toBe(2);
  expect(() => O.take(s)).toThrow();
});
