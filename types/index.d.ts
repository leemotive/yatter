type OneOrMore<T> = T | T[];
type AnyFunction<T = unknown> = (...args: unknown[]) => T;
type AnyAsyncFunction = (...args: unknown[]) => Promise<unknown>;

type NotArray<T> = T extends unknown[] ? never : T extends object ? T : never;
type AnyObject<T = unknown> = { [k: string]: T };
