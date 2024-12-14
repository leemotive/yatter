import { toPascalCase } from './case';
/**
 * 是否是函数
 * @param input
 * @returns
 */
export function isFunction(input: unknown): input is AnyFunction {
  return typeof input === 'function';
}

/**
 * 是否是 async 函数
 * @param input
 * @returns
 */
export function isAsyncFunction(input: unknown): input is AnyAsyncFunction {
  return isFunction(input) && input?.constructor?.name === 'AsyncFunction';
}

/**
 * 是否是null 或者 undefined
 * @param input
 * @returns
 */
export function isNullOrUndef(input: unknown): input is null | undefined {
  return input === null || input === undefined;
}

/**
 * 是否是 symbol
 * @param input
 * @returns
 */
export function isSymbol(input: unknown): input is symbol {
  return typeof input === 'symbol';
}

/**
 * 是否是字符串
 * @param input
 * @returns
 */
export function isString(input: unknown): input is string {
  return typeof input === 'string';
}

/**
 * 是否是数字
 * @param input
 * @returns
 */
export function isNumber(input: unknown): input is number {
  return typeof input === 'number';
}

/**
 * 是否是正则
 * @param input
 * @returns
 */
export function isRegExp(input: unknown): input is RegExp {
  return input instanceof RegExp;
}

/**
 * 是否是布尔值
 * @param input
 * @returns
 */
export function isBoolean(input: unknown): input is boolean {
  return input === true || input === false;
}

/**
 * 是否是对象
 * @param input
 * @returns
 */
export function isObject(input: unknown): input is AnyObject {
  return !!input && typeof input === 'object';
}

/**
 * 是否是简单对象
 * @param input
 * @returns
 */
export function isPlainObject(input: unknown): input is AnyObject {
  if (!isObject(input)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(input) as object;
  if (!prototype) {
    return true;
  }
  return Object.hasOwn(prototype, 'constructor') && prototype.constructor === Object;
}

/**
 * 参数一和参数二是否是相同类型
 * @param input
 * @returns
 */
export function isSameType(a: unknown, b: unknown) {
  if (a === b) {
    return true;
  }
  if (a == null || b == null) {
    return false;
  }

  return a.constructor === b.constructor;
}

/**
 * 所有参数是否都是相同类型
 * @param criterion
 * @param others
 * @returns
 */
export function isAllSameType(criterion: unknown, ...others: unknown[]) {
  return others.every(o => isSameType(criterion, o));
}

/**
 * 参数一是否属于参数二的类型
 * @param input
 * @param type
 * @returns
 */
export function isType(input: unknown, type: unknown) {
  let Type = '';

  if (typeof type === 'function') {
    if (type !== Object && typeof input === 'object') {
      return input instanceof type;
    }
    Type = type.name;
  } else if (typeof type === 'string') {
    Type = toPascalCase(type);
  } else if (type === null) {
    Type = 'Null';
  } else if (type === undefined) {
    Type = 'Undefined';
  }

  return Object.prototype.toString.call(input) === `[object ${Type}]`;
}

/**
 * 参数一数组中元素是否均属于参数二类型
 * @param inputs
 * @param type
 * @returns
 */
export function isAllType(inputs: unknown[], type: unknown) {
  return inputs.every(input => isType(input, type));
}

/**
 * 是否是 js 内置函数，(并不可靠), 自定义函数也可以通过 hack 使判断结果为真
 * @param input
 * @returns
 */
export function isBuiltInFunction(input: AnyFunction) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (input.toString === Object.getPrototypeOf(input).toString) {
    if (input.toString() === `function ${input.name}() { [native code] }`) {
      return true;
    }
  }
  return input === Function.prototype;
}
