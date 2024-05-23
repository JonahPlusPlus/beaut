import * as R from ".";
import * as O from "../option";
import { chain } from "..";

test("result kind testers", () => {
  // isSome and isNone
  const e = R.Err("err");
  expect(R.isErr(e)).toBe(true);
  expect(R.isOk(e)).toBe(false);
  const o = R.Ok(2);
  expect(R.isOk(o)).toBe(true);
  expect(R.isErr(o)).toBe(false);

  // isSomeAnd
  expect(chain(o)(R.isOkAnd((x) => x.value > 1)).end()).toBe(true);
  expect(chain(o)(R.isOkAnd((x) => x.value > 3)).end()).toBe(false);
});

test("unwrap err", () => {
  const e = R.Err("err");
  expect(() => R.unwrap(e)).toThrow("err");
});

test("expect err", () => {
  const e = R.Err("err");
  expect(() => chain(e)(R.expect("bad")).end()).toThrow("bad: err");
});

test("unwrap ok", () => {
  const o = R.Ok(2);
  expect(R.unwrap(o)).toBe(2);
  expect(() => R.drop(o)).toThrow();
});

test("expect ok", () => {
  const o = R.Ok(2);
  let v = R.expect("bad")(o);
  expect(v).toBe(2);
  expect(() => R.drop(o)).toThrow();
});

test("unwrapOr err", () => {
  const e: R.Result<number, string> = R.Err("err");
  expect(chain(e)(R.unwrapOr(3)).end()).toBe(3);
  expect(() => R.drop(e)).toThrow();
});

test("unwrapOr ok", () => {
  const o = R.Ok(2);
  expect(chain(o)(R.unwrapOr(3)).end()).toBe(2);
  expect(() => R.drop(o)).toThrow();
});

test("unwrapOrElse err", () => {
  const e: R.Result<number, string> = R.Err("err");
  expect(chain(e)(R.unwrapOrElse(() => 3)).end()).toBe(3);
  expect(() => R.drop(e)).toThrow();
});

test("unwrapOrElse ok", () => {
  const o = R.Ok(2);
  expect(chain(o)(R.unwrapOrElse(() => 3)).end()).toBe(2);
  expect(() => R.drop(o)).toThrow();
});

test("unwrapErr err", () => {
  const e = R.Err("err");
  expect(R.unwrapErr(e)).toBe("err");
  expect(() => R.drop(e)).toThrow();
});

test("expectErr err", () => {
  const e = R.Err("err");
  let v = R.expectErr("bad")(e);
  expect(v).toBe("err");
  expect(() => R.drop(e)).toThrow();
});

test("unwrapErr ok", () => {
  const o = R.Ok(2);
  expect(() => R.unwrapErr(o)).toThrow("2");
});

test("expectErr ok", () => {
  const o = R.Ok(2);
  expect(() => chain(o)(R.expectErr("bad")).end()).toThrow("bad: 2");
});

test("intoOk", () => {
  expect(chain(R.Ok<number, never>(2))(R.intoOk).end()).toBe(2);
});

test("intoErr", () => {
  expect(chain(R.Err<never, string>("err"))(R.intoErr).end()).toBe("err");
});

test("eq true", () => {
  const a = R.Ok(2);
  const b = R.Ok(2);
  expect(chain(a)(R.eq(b)).end()).toBe(true);
  expect(() => R.drop(a)).not.toThrow();
  expect(() => R.drop(b)).not.toThrow();
});

test("eq false", () => {
  const a = R.Ok(2);
  const b = R.Ok(3);
  expect(chain(a)(R.eq(b)).end()).toBe(false);
  expect(() => R.drop(a)).not.toThrow();
  expect(() => R.drop(b)).not.toThrow();
});

test("and err", () => {
  expect(chain(R.Err("err"))(R.and(R.Err("err2"))).end()).toStrictEqual(
    R.Err("err"),
  );
  expect(chain(R.Err("err"))(R.and(R.Ok(2))).end()).toStrictEqual(R.Err("err"));
  expect(
    chain(R.Ok<number, string>(3))(R.and(R.Err("err"))).end(),
  ).toStrictEqual(R.Err("err"));
});

test("and ok", () => {
  expect(chain(R.Ok(1))(R.and(R.Ok(2))).end()).toStrictEqual(R.Ok(2));
});

test("andThen err", () => {
  expect(
    chain(R.Err<number, string>("err"))(
      R.andThen((v) => R.Err("err" + v)),
    ).end(),
  ).toStrictEqual(R.Err("err"));
  expect(
    chain(R.Err<number, string>("err"))(R.andThen((v) => R.Ok(2 + v))).end(),
  ).toStrictEqual(R.Err("err"));
  expect(
    chain(R.Ok<number, string>(3))(R.andThen((v) => R.Err("err" + v))).end(),
  ).toStrictEqual(R.Err("err3"));
});

test("andThen ok", () => {
  expect(chain(R.Ok(1))(R.andThen((v) => R.Ok(2 + v))).end()).toStrictEqual(
    R.Ok(3),
  );
});

test("or err", () => {
  expect(chain(R.Err("err"))(R.or(R.Err("err2"))).end()).toStrictEqual(
    R.Err("err2"),
  );
});

test("or ok", () => {
  expect(
    chain(R.Err<number, string>("err"))(R.or(R.Ok(2))).end(),
  ).toStrictEqual(R.Ok(2));
  expect(
    chain(R.Ok<number, string>(2))(R.or(R.Err("err"))).end(),
  ).toStrictEqual(R.Ok(2));
  expect(chain(R.Ok<number, string>(1))(R.or(R.Ok(2))).end()).toStrictEqual(
    R.Ok(1),
  );
});

test("orElse err", () => {
  expect(
    chain(R.Err("err"))(R.orElse((err) => R.Err(err + "2"))).end(),
  ).toStrictEqual(R.Err("err2"));
});

test("orElse ok", () => {
  expect(
    chain(R.Err<number, string>("err"))(
      R.orElse((err) => R.Ok(err.length)),
    ).end(),
  ).toStrictEqual(R.Ok(3));
  expect(
    chain(R.Ok<number, string>(2))(R.orElse((err) => R.Err(err + 2))).end(),
  ).toStrictEqual(R.Ok(2));
  expect(
    chain(R.Ok<number, string>(1))(R.orElse((err) => R.Ok(err.length))).end(),
  ).toStrictEqual(R.Ok(1));
});

test("transpose ok", () => {
  const ro = R.Ok(O.Some(3));
  const or = R.transpose(ro);
  expect(or).toStrictEqual(O.Some(R.Ok(3)));
});

test("transpose err", () => {
  const ro = R.Err<O.Option<number>, string>("err");
  const or = R.transpose(ro);
  expect(or).toStrictEqual(O.Some(R.Err("err")));
});

test("transpose none", () => {
  const ro = R.Ok(O.None());
  const or = R.transpose(ro);
  expect(or).toStrictEqual(O.None());
});

test("flatten", () => {
  const rr = R.Ok(R.Ok(2));
  const r = R.flatten(rr);
  expect(r).toStrictEqual(R.Ok(2));
});

test("toObject", () => {
  const o = R.Ok(3);
  expect(R.toObject(o)).toStrictEqual({ ok: true, value: 3 });
  const e = R.Err("err");
  expect(R.toObject(e)).toStrictEqual({ ok: false, value: "err" });
});

test("switch-case ok", () => {
  const o = R.Ok(2);
  const obj = R.toObject(o);
  let a = 0;
  switch (obj.ok) {
    case true:
      a = obj.value;
      break;
    case false:
      a = 100;
      break;
  }
  expect(a).toBe(2);
  expect(() => R.drop(o)).toThrow();
});
