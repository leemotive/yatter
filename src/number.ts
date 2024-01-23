/**
 * 将数字转为字符串，同时避免自动科学记数法
 * @param n
 * @returns
 */
export function toString(n: number) {
  const str = `${n}`;
  if (str.includes('e')) {
    // 自动科学记数了
    const [base, scale] = str.split('e');
    return shiftRight(+base, +scale);
  }
  return str;
}

/**
 * 数字 n 扩大 10 的 power 次方
 * @param n
 * @param power - 如果是负数则原数缩小
 * @returns
 */
export function shiftRight(n: number, power: number): string {
  if (power < 0) {
    return shiftLeft(n, -power);
  }
  const str = toString(n);
  if (!power) {
    return str;
  }
  const shiftReg = new RegExp(`\\.(\\d{${power}})`);
  return trimZero(`${str}${'0'.repeat(power)}`.replace(shiftReg, '$1.'));
}

/**
 * 数字 n 缩小 10 的 power 次方
 * @param n
 * @param power - 如果是负数则原数扩大
 * @returns
 */
export function shiftLeft(n: number, power: number): string {
  if (power < 0) {
    return shiftRight(n, -power);
  }
  const str = toString(n);
  if (!power) {
    return str;
  }
  const shiftReg = new RegExp(`(\\d{${power}})(\\.|$)`);
  return trimZero(str.replace(/^-?/, `$&${'0'.repeat(power)}`).replace(shiftReg, '.$1'));
}

/**
 * 修复数字 toFixed 方法精度问题
 * @param n
 * @param digits
 * @returns
 */
export function toFixed(n: number, digits: number) {
  let n4Fixed = n;
  const str = toString(n);
  if (str.includes('.')) {
    const arr = str.split('.');
    arr[1] = `${arr[1].padEnd(digits, '0')}1`;
    n4Fixed = +arr.join('.');
  }
  return n4Fixed.toFixed(digits);
}

/**
 * 去除字符串格式的数字前后0
 * @param n
 * @returns
 */
export function trimZero(n: string) {
  // 先移除先置无效0， 再移除后置无效0
  return n
    .replace(/(^-?)0*(\d+\.)/, '$1$2')
    .replace(/(\.\d*?)0*$/, '$1')
    .replace(/\.$/, '');
}

export type CompareOption = {
  boundary: '[]' | '()' | '[)' | '(]';
};
/**
 * 判断数字是否在两个数字中间
 * @param target
 * @param min
 * @param max
 * @param option
 * @param option.boundary - 数学开闭区间的方式限定是否包含左右边界 default is ()
 * @returns
 */
export function isBetween(target: number, min: number, max: number, option: CompareOption = { boundary: '()' }) {
  const [left, right] = option.boundary;
  if (target < min) {
    return false;
  }
  if (left === '(' && target === min) {
    return false;
  }
  if (target > max) {
    return false;
  }
  if (right === ')' && target === max) {
    return false;
  }
  return true;
}

/**
 * 多个数字求和
 * @param numbers
 * @returns
 */
export function sum(...numbers: number[]): number {
  return numbers.reduce((t, c) => t + c, 0);
}

/**
 * 求平均值
 * @param numbers
 * @returns
 */
export function avg(...numbers: number[]): number {
  return sum(...numbers) / numbers.length;
}

/**
 * 千分位分割，不考虑自动科学计数法的的情况
 * @param n
 * @param option
 * @param option.trim - 是否先移除前导及后置无效数字0 default is false
 * @param option.native - 使用 js 自有格式化方法 toLocaleString 的配置项
 * @returns
 */
export function toThousand(
  n: string | number,
  { trim = false, native }: { trim?: boolean; native?: Intl.NumberFormatOptions } = {},
) {
  if (native) {
    return (typeof n === 'string' ? +n : n).toLocaleString(undefined, native);
  }

  const from = typeof n === 'string' && trim ? +n : n;
  return `${from}`.replace(/(-?\d{1,3})(?=(?:\d{3})+[.$])/g, '$1,');
}

/**
 * 除法运算返回商和余数组成的数组
 * @param dividend - 被除数
 * @param divisor - 除数
 * @returns 数组 [商, 余数]
 */
export function divide(dividend: number, divisor: number) {
  const quotient = Math.trunc(dividend / divisor);
  const remainder = dividend % divisor;
  return [quotient, remainder];
}
