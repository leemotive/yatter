/* eslint-disable @typescript-eslint/no-explicit-any */

type OneOrMore<T> = T | T[];
type AnyFunction<T = any> = (...args: any[]) => T;
type AnyAsyncFunction = (...args: any[]) => Promise<any>;

type ObjectKey = string | number | symbol;
type NotArray<T> = Exclude<T, any[]>; // T extends unknown[] ? never : T extends object ? T : never;
type AnyObject<T = unknown> = { [k: ObjectKey]: T };
