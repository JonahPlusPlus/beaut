import { Mut, chain, empty } from "..";
import * as R from "../result";

/**
 * Task status state.
 */
export enum TaskStatus {
  Pending,
  Resolved,
  Rejected,
}

interface TaskInner<T> {
  promise: Promise<T>;
  status: Mut<TaskStatus>;
  cancel?: () => void;
}

/**
 * An extended definition of `Promise<T>`.
 *
 * A task may be canceled.
 */
export class Task<T> {
  private inner?: TaskInner<T>;

  constructor(inner: TaskInner<T>) {
    this.inner = inner;
  }
}

/**
 * Spawns a new task from a future.
 */
export function spawn<T>(fut: Future<T>): Task<T> {
  let status: Mut<TaskStatus> = {
    value: TaskStatus.Pending,
  };
  let cancel: () => void;
  let promise = new Promise<T>((_resolve, _reject) => {
    const resolve = (value: T | PromiseLike<T>) => {
      _resolve(value);
      status.value = TaskStatus.Resolved;
    };
    const reject = (reason?: any) => {
      _reject(reason);
      status.value = TaskStatus.Rejected;
    };
    const _cancel = fut(resolve, reject);
    cancel = _cancel instanceof Function ? _cancel : undefined;
  });
  return new Task({ promise, status, cancel });
}

/**
 * Cancels a task.
 */
export function cancel(self: Task<any>) {
  const t = drop(self);
  t["inner"].cancel?.();
}

/**
 * Get the promise of the task.
 */
export function use<T>(self: Task<T>): Promise<T> {
  const t = drop(self);
  return t["inner"].promise;
}

/** Immediately checks if a task is pending. */
export function isPending(task: Task<any>): boolean {
  return task["inner"].status.value === TaskStatus.Pending;
}

/** Immediately checks if a task is resolved. */
export function isResolved(task: Task<any>) {
  return task["inner"].status.value === TaskStatus.Resolved;
}

/** Immediately checks if a task is rejected. */
export function isRejected(task: Task<any>) {
  return task["inner"].status.value === TaskStatus.Rejected;
}

/**
 * Moves the value out of the task, leaving nothing behind.
 *
 * This is useful for preserving ownership, since it makes the old option unusable.
 */
export function drop<T>(self: Task<T>): Task<T> {
  assertDefined(self);
  const t = new Task(self["inner"]);
  self["inner"] = undefined;
  return t;
}

/**
 * Used to assert that the `Task` is not consumed.
 *
 * @throws Will throw if the inner value is undefined.
 */
export function assertDefined<T>(self: Task<T>) {
  if (self["inner"] === undefined) {
    throw new Error("cannot use consumed task");
  }
}

/**
 * A lazy, extended promise.
 *
 * A future is simply an executor which has not been used by a task.
 * The executor may return a callback to cancel the promise.
 */
export type Future<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void,
) => (() => void) | void;

/**
 * Map this future’s output to a different type, returning a new future of the resulting type.
 */
export function map<T, U>(f: (value: T) => U): (fut: Future<T>) => Future<U> {
  return function (fut: Future<T>) {
    return (resolve, reject) => {
      const task = spawn(fut);
      use(task)
        .then((x) => resolve(f(x)))
        .catch(reject);
      return () => cancel(task);
    };
  };
}

/**
 * Chain on a computation for when a future finished, passing the result of the future to the provided closure `f`.
 *
 * The closure must return a new future and is only run *after* successful completion of the self future.
 */
export function then<T, U>(
  f: (value: T) => Future<U>,
): (fut: Future<T>) => Future<U> {
  return function (fut: Future<T>) {
    return (resolve, reject) => {
      const taskA = spawn(fut);
      const cancel: Mut<undefined | (() => void)> = {
        value: taskA["inner"].cancel,
      };

      use(taskA)
        .then((v) => {
          const taskB = spawn(f(v));
          cancel.value = taskB["inner"].cancel;

          use(taskB).then(resolve).catch(reject);
        })
        .catch(reject);

      return () => cancel.value?.();
    };
  };
}

/**
 * Executes another future after this one resolves successfully.
 * The success value is passed to a closure to create this subsequent future.
 *
 * The provided closure `f` will only be called if this future is resolved to an `Ok`.
 * If this future resolves to an `Err`, rejects or was canceled, then the provided closure will never be invoked.
 * The `Error` type of this future and the future returned by `f` have to match.
 */
export function andThen<T, U, E>(
  f: (value: T) => Future<R.Result<U, E>>,
): (fut: Future<R.Result<T, E>>) => Future<R.Result<U, E>> {
  return function (fut: Future<R.Result<T, E>>) {
    return (resolve, reject) => {
      const taskA = spawn(fut);
      const cancel: Mut<undefined | (() => void)> = {
        value: taskA["inner"].cancel,
      };

      use(taskA)
        .then((r) => {
          const obj = R.toObject(r);
          if (obj.ok === true) {
            const taskB = spawn(f(obj.value));
            cancel.value = taskB["inner"].cancel;
            use(taskB).then(resolve).catch(reject);
          } else {
            resolve(obj.value);
          }
        })
        .catch(reject);
    };
  };
}
