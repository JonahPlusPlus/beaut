import * as F from ".";
import * as R from "../result";
import { chain } from "..";

test("basic task", async () => {
  const task = F.spawn<number>((resolve) => {
    resolve(3);
  });
  await expect(F.use(task)).resolves.toBe(3);
});

test("cancel task resolve", async () => {
  const task = F.spawn<number>((resolve) => {
    resolve(3);
  });
  F.cancel(task);
  expect(() => F.use(task)).toThrow();
});

test("cancel task reject", async () => {
  const task = F.spawn<number>((resolve) => {
    const to = setTimeout(resolve, 3000, 3);
    return () => {
      clearTimeout(to);
    };
  });
  F.cancel(task);
  expect(() => F.use(task)).toThrow();
});

test("map", async () => {
  const a: F.Future<number> = (resolve) => {
    resolve(3);
  };
  const fut = chain(a)(F.map<number, string>((x) => "Received: " + x)).end();
  const task = F.spawn(fut);
  await expect(F.use(task)).resolves.toBe("Received: 3");
});

test("then", async () => {
  const a: F.Future<number> = (resolve) => {
    resolve(3);
  };
  const fut = chain(a)(
    F.then<number, string>((x) => (resolve) => {
      resolve(`Received: ${x}`);
    }),
  ).end();
  const task = F.spawn(fut);
  await expect(F.use(task)).resolves.toBe("Received: 3");
});

test("andThen", async () => {
  const a: F.Future<R.Result<number, string>> = (resolve) => {
    resolve(R.Ok(3));
  };
  const fut = chain(a)(
    F.andThen((x) => (resolve) => {
      resolve(R.Ok(`Received: ${x}`));
    }),
  ).end();
  const task = F.spawn(fut);
  await expect(F.use(task)).resolves.toStrictEqual(R.Ok("Received: 3"));
});

test("isPending false", async () => {
  const task: F.Task<number> = F.spawn((resolve) => {
    resolve(3);
  });
  expect(F.isPending(task)).toBe(false);
});

test("isPending true", async () => {
  const task: F.Task<number> = F.spawn((resolve) => {
    const to = setTimeout(resolve, 3000, 3);
    return () => {
      clearTimeout(to);
    };
  });
  expect(F.isPending(task)).toBe(true);
  F.cancel(task);
});
