/* eslint-disable @typescript-eslint/no-explicit-any */

type OneOrMore<T> = T | T[];
type AnyFunction<T = any> = (...args: any[]) => T;
type AnyAsyncFunction = (...args: any[]) => Promise<any>;

type NotArray<T> = T extends unknown[] ? never : T extends object ? T : never;
type AnyObject<T = unknown> = { [k: string]: T };
