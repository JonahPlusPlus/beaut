export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, ab: (_: A) => B): B;
export function pipe<A, B, C>(a: A, ab: (_: A) => B, bc: (_: B) => C): C;
export function pipe<A, B, C, D>(
  a: A,
  ab: (_: A) => B,
  bc: (_: B) => C,
  cd: (_: C) => D,
): D;
export function pipe<A, B, C, D, E>(
  a: A,
  ab: (_: A) => B,
  bc: (_: B) => C,
  cd: (_: C) => D,
  de: (_: D) => E,
): E;
export function pipe<A, B, C, D, E, F>(
  a: A,
  ab: (_: A) => B,
  bc: (_: B) => C,
  cd: (_: C) => D,
  de: (_: D) => E,
  ef: (_: E) => F,
): F;
export function pipe<A, B, C, D, E, F, G>(
  a: A,
  ab: (_: A) => B,
  bc: (_: B) => C,
  cd: (_: C) => D,
  de: (_: D) => E,
  ef: (_: E) => F,
  fg: (_: F) => G,
): G;
export function pipe<A, B, C, D, E, F, G, H>(
  a: A,
  ab: (_: A) => B,
  bc: (_: B) => C,
  cd: (_: C) => D,
  de: (_: D) => E,
  ef: (_: E) => F,
  fg: (_: F) => G,
  gh: (_: G) => H,
): H;
export function pipe<A, B, C, D, E, F, G, H, I>(
  a: A,
  ab: (_: A) => B,
  bc: (_: B) => C,
  cd: (_: C) => D,
  de: (_: D) => E,
  ef: (_: E) => F,
  fg: (_: F) => G,
  gh: (_: G) => H,
  hi: (_: H) => I,
): I;
export function pipe<A, B, C, D, E, F, G, H, I, J>(
  a: A,
  ab: (_: A) => B,
  bc: (_: B) => C,
  cd: (_: C) => D,
  de: (_: D) => E,
  ef: (_: E) => F,
  fg: (_: F) => G,
  gh: (_: G) => H,
  hi: (_: H) => I,
  ij: (_: I) => J,
): J;
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
  a: A,
  ab: (_: A) => B,
  bc: (_: B) => C,
  cd: (_: C) => D,
  de: (_: D) => E,
  ef: (_: E) => F,
  fg: (_: F) => G,
  gh: (_: G) => H,
  hi: (_: H) => I,
  ij: (_: I) => J,
  jk: (_: J) => K,
): K;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L>(
  a: A,
  ab: (_: A) => B,
  bc: (_: B) => C,
  cd: (_: C) => D,
  de: (_: D) => E,
  ef: (_: E) => F,
  fg: (_: F) => G,
  gh: (_: G) => H,
  hi: (_: H) => I,
  ij: (_: I) => J,
  jk: (_: J) => K,
  kl: (_: K) => L,
): L;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M>(
  a: A,
  ab: (_: A) => B,
  bc: (_: B) => C,
  cd: (_: C) => D,
  de: (_: D) => E,
  ef: (_: E) => F,
  fg: (_: F) => G,
  gh: (_: G) => H,
  hi: (_: H) => I,
  ij: (_: I) => J,
  jk: (_: J) => K,
  kl: (_: K) => L,
  lm: (_: L) => M,
): M;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
  a: A,
  ab: (_: A) => B,
  bc: (_: B) => C,
  cd: (_: C) => D,
  de: (_: D) => E,
  ef: (_: E) => F,
  fg: (_: F) => G,
  gh: (_: G) => H,
  hi: (_: H) => I,
  ij: (_: I) => J,
  jk: (_: J) => K,
  kl: (_: K) => L,
  lm: (_: L) => M,
  mn: (_: M) => N,
): N;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
  a: A,
  ab: (_: A) => B,
  bc: (_: B) => C,
  cd: (_: C) => D,
  de: (_: D) => E,
  ef: (_: E) => F,
  fg: (_: F) => G,
  gh: (_: G) => H,
  hi: (_: H) => I,
  ij: (_: I) => J,
  jk: (_: J) => K,
  kl: (_: K) => L,
  lm: (_: L) => M,
  mn: (_: M) => N,
  no: (_: N) => O,
): O;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
  a: A,
  ab: (_: A) => B,
  bc: (_: B) => C,
  cd: (_: C) => D,
  de: (_: D) => E,
  ef: (_: E) => F,
  fg: (_: F) => G,
  gh: (_: G) => H,
  hi: (_: H) => I,
  ij: (_: I) => J,
  jk: (_: J) => K,
  kl: (_: K) => L,
  lm: (_: L) => M,
  mn: (_: M) => N,
  no: (_: N) => O,
  op: (_: O) => P,
): P;
export function pipe(
  input: unknown,
  ...args: ((x: unknown) => unknown)[]
): unknown {
  switch (args.length) {
    case 0:
      return input;
    case 1:
      return args[0](input);
    case 2:
      return args[1](args[0](input));
    case 3:
      return args[2](args[1](args[0](input)));
    case 4:
      return args[3](args[2](args[1](args[0](input))));
    case 5:
      return args[4](args[3](args[2](args[1](args[0](input)))));
    case 6:
      return args[5](args[4](args[3](args[2](args[1](args[0](input))))));
    case 7:
      return args[6](
        args[5](args[4](args[3](args[2](args[1](args[0](input)))))),
      );
    case 8:
      return args[7](
        args[6](args[5](args[4](args[3](args[2](args[1](args[0](input))))))),
      );
    case 9:
      return args[8](
        args[7](
          args[6](args[5](args[4](args[3](args[2](args[1](args[0](input))))))),
        ),
      );
    default:
      let out = input;
      for (let i = 0; i < args.length; i++) {
        out = args[i](out);
      }
      return out;
  }
}
