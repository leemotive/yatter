/**
 * 跟数组相关的处理
 *
 * @module
 */

import { self } from './function';

type GroupByReturn<T> = Record<string, T[]>;
type IndexKey<T> = Exclude<keyof T, keyof { [K in keyof T as T[K] extends string | number ? never : K]: false }>;

/**
 * 根据属性名对参数一数组进行分组
 * @param arr
 * @param groupKey
 */
export function groupBy<T>(arr: T[], groupKey: IndexKey<T>): GroupByReturn<T>;
/**
 * 根据参数二的函数返回的值对参数一数组进行分组
 * @param arr
 * @param groupKey
 */
export function groupBy<T>(arr: T[], groupKey: (ele: T, index: number) => string): GroupByReturn<T>;
export function groupBy<T>(arr: T[], groupKey: IndexKey<T> | ((ele: T, index: number) => string)): GroupByReturn<T> {
  const result: GroupByReturn<T> = {};
  arr.forEach((ele, index) => {
    const key = typeof groupKey === 'function' ? groupKey(ele, index) : (ele[groupKey] as string);
    if (!Array.isArray(result[key])) {
      result[key] = [];
    }
    result[key].push(ele);
  });

  return result;
}

/**
 * 对参数数组进行去重
 * @param arr
 */
export function unique<T>(arr: T[]): T[];
/**
 * 根据对象属性对参数一数组进行去重
 * @param arr
 * @param uniqueKey
 */
export function unique<T>(arr: T[], uniqueKey: IndexKey<T>): T[];
/**
 * 根据函数返回的值对参数一数组进行去重
 * @param arr
 * @param uniqueKey
 */
export function unique<T>(arr: T[], uniqueKey: (ele: T, index: number) => unknown): T[];
export function unique<T>(arr: T[], uniqueKey: IndexKey<T> | ((ele: T, index: number) => unknown) = self): T[] {
  const keysSet = new Set();
  const result: T[] = [];
  arr.forEach((ele, index) => {
    let key: unknown = ele;
    if (typeof uniqueKey === 'function') {
      key = uniqueKey(ele, index);
    } else if (uniqueKey) {
      key = ele[uniqueKey];
    }
    if (!keysSet.has(key)) {
      result.push(ele);
      keysSet.add(key);
    }
  });
  return result;
}

type UnionTuple<T extends unknown[][]> = T extends [infer F, ...infer O extends unknown[][]]
  ? F extends (infer I)[]
    ? [I, ...UnionTuple<O>]
    : T
  : T;
/**
 * 多个数组按照顺序合并，形成二维数组
 * @param args
 * @returns
 *
 * @example
 * ```ts
 * parallel([1, 0], [true, false]) // [[1, true], [0, false]]
 * ```
 *
 */
export function parallel<T extends unknown[][]>(...args: T): UnionTuple<T>[] {
  const len = Math.max(...args.map(arg => arg.length));
  const result = [];
  for (let index = 0; index < len; index++) {
    result.push(
      args.reduce((r, c) => {
        r.push(c[index]);
        return r;
      }, []) as UnionTuple<T>,
    );
  }
  return result;
}

type OrderType = 'asc' | 'desc';
/**
 * 为数组 sort 方法生成排序函数， 根据根据参数一函数返回的数组依次排序
 * @param calKey 计算排序数组
 * @param order
 * @returns 排序函数
 *
 * @example
 * ```ts
 * // 先按年龄升序，同年龄的按名字降序
 * [{age: 12, name: 'Tom'}].sort(sorter(person => [person.age, person.name], ['asc', 'desc']))
 * ```
 */
export function sorter<T>(calKey: (ele: T) => Array<number | string>, order: OneOrMore<OrderType> = 'asc') {
  return (a: T, b: T) => {
    const akeys = calKey(a);
    const bkeys = calKey(b);
    const orders = Array.isArray(order) ? order : Array(akeys.length).fill(order);

    const keys = parallel(akeys, bkeys);

    const index = keys.findIndex(([ak, bk]) => String(ak) !== String(bk));

    // eslint-disable-next-line no-bitwise
    if (~index) {
      const [ak, bk] = keys[index];
      return ak > bk !== (orders[index] === 'desc') ? 1 : -1;
    }
    return 0;
  };
}

/**
 * 根据对象属性查找最大值
 * @param arr
 * @param compareKey
 */
export function max<T>(arr: T[], compareKey: IndexKey<T>): T;
/**
 * 根据参数二函数返回的值查找最大值
 * @param arr
 * @param compareKey
 */
export function max<T>(arr: T[], compareKey: (ele: T, index: number) => number | string): T;
export function max<T>(arr: T[], compareKey: IndexKey<T> | ((ele: T, index: number) => number | string)): T {
  const values = arr.map((c, i) => (typeof compareKey === 'function' ? compareKey(c, i) : (c[compareKey] as string)));
  const maxValue = values.slice().sort(sorter(t => [t], 'desc'))[0];
  const index = values.findIndex(v => v === maxValue);
  return arr[index];
}

/**
 * 根据对象属性查找最小值
 * @param arr
 * @param compareKey
 */
export function min<T>(arr: T[], compareKey: IndexKey<T>): T;
/**
 * 根据参数二函数返回的值查找最小值
 * @param arr
 * @param compareKey
 */
export function min<T>(arr: T[], compareKey: (ele: T, index: number) => number | string): T;
export function min<T>(arr: T[], compareKey: IndexKey<T> | ((ele: T, index: number) => number | string)): T {
  const values = arr.map((c, i) => (typeof compareKey === 'function' ? compareKey(c, i) : (c[compareKey] as string)));
  const minValue = values.slice().sort(sorter(t => [t], 'asc'))[0];
  const index = values.findIndex(v => v === minValue);
  return arr[index];
}

/**
 * 两个数组做交叉合并, 任何一个数组剩余的元素将拼接在结果数组最后
 * @param a
 * @param b
 * @returns
 *
 * @example
 * ```ts
 * cross([1, 2], [3, 4]) // [1, 3, 2, 4]
 * ```
 */
export function cross<R, T>(a: R[], b: T[]): Array<R | T> {
  const result: Array<R | T> = [];
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    result.push(a[i], b[i]);
  }
  if (len < a.length) {
    result.push(...a.slice(len));
  } else {
    result.push(...b.slice(len));
  }
  return result;
}
