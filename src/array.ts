/**
 * 跟数组相关的处理
 *
 * @module
 */

import { self } from './function';
import { isFunction, isNullOrUndef, isString } from './type';

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

/**
 * 多个数组按照顺序合并，形成二维数组
 * @param args
 * @returns
 *
 * @example
 * ```ts
 * parallel([1, 0], [true, false]) // [[1, true], [0, false]]
 * ```
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

type CollConfig = { key: AnyFunction };
type CollAgrs<T> = [T[], ...T[][], CollConfig] | T[][];
function isCollConfig(param: any): param is CollConfig {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return typeof param?.key === 'function';
}
/**
 * 计算数组的交集，可以传多个数组，最后一个参数可以是包括 key 方法的对象，key 方法用来唯一标识一个元素
 *
 * @example
 * ```js
 * intersect([{id: 34}], [{id: 34}])  // []
 * intersect([{id: 34}], [{id: 34}], {key: a => a.id})  // [{id: 34}]
 * ```
 *
 * @returns
 */
export function intersect<T>(...args: CollAgrs<T>): T[] {
  let getkey: AnyFunction = self;
  const config = args.at(-1);
  if (isCollConfig(config)) {
    args.pop();
    if (config?.key) {
      getkey = config.key;
    }
  }

  const keys = (args as T[][]).slice(1).map(t => new Set(t.map(getkey)));
  return args[0].filter(t => keys.every(s => s.has(getkey(t))));
}

/**
 * 计算并集，参数和 intersect 参数一样
 * @returns
 */
export function union<T>(...args: CollAgrs<T>): T[] {
  let getkey: AnyFunction = self;
  const config = args.at(-1);
  if (isCollConfig(config)) {
    args.pop();
    if (config?.key) {
      getkey = config.key;
    }
  }

  const map = new Map<any, T>();
  (args as T[][]).flat().forEach(t => {
    map.set(getkey(t), t);
  });
  return [...map.values()];
}

/**
 * 计算差集，参数和 intersect 参数一样
 * @returns
 */
export function diff<T>(...args: CollAgrs<T>): T[] {
  let getkey: AnyFunction = self;
  const config = args.at(-1);
  if (isCollConfig(config)) {
    args.pop();
    if (config?.key) {
      getkey = config.key;
    }
  }

  const set = new Set(args.slice(1).flat().map(getkey));
  return args[0].filter(t => !set.has(getkey(t)));
}

/**
 * 尝试将第一个参数转化为数组，如果已经是数组了，直接返回
 * @param input 需要尝试包装数组的参数
 * @returns
 */
export function ensureArray<T>(input?: OneOrMore<T>): T[] {
  if (isNullOrUndef(input)) {
    return [];
  }
  if (Array.isArray(input)) {
    return input;
  }
  return [input];
}

export function createBoundArray<T>(
  len: number,
  { init = [], keep = 'end' }: { init?: T[]; keep?: 'start' | 'end' } = {},
) {
  const res: T[] = [];
  const proxy = new Proxy(res, {
    get(target, prop) {
      const v = Reflect.get(target, prop);
      if (!isFunction(v)) {
        return v;
      }
      return function fun(...args: any[]) {
        let ret = Reflect.apply(v, target, args);
        if (target.length > len) {
          if (keep === 'end') {
            target.copyWithin(0, -len);
          }
          target.length = len;
        }

        if (['push', 'unshift'].includes(prop as string) && (ret as number) > len) {
          ret = len;
        }

        return ret;
      };
    },
    set(target, prop, value) {
      if (prop === 'length' && value <= target.length) {
        Reflect.set(target, prop, value);
        return true;
      }
      if (isString(prop) && /^(0|[1-9]\d*)$/.test(prop)) {
        if (Number(prop) < target.length) {
          Reflect.set(target, prop, value);
          return true;
        }
      }
      return true;
    },
  });

  if (init.length) {
    proxy.push(...init);
  }

  return proxy;
}
