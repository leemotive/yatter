import { describe, expect, test } from 'vitest';
import {
  type CompareOption,
  avg,
  toString as convertString,
  divide,
  isBetween,
  shiftLeft,
  shiftRight,
  sum,
  toFixed,
  toThousand,
  trimZero,
} from '../src/number';

describe('shiftLeft', () => {
  test.each([
    [-20, 2, '-0.2'],
    [2.1, 2, '0.021'],
    [0.0000005, 2, '0.000000005'],
  ])('shiftLeft-%#', (input, scale, result) => {
    expect(shiftLeft(input, scale)).toBe(result);
  });
});

describe('shiftRight', () => {
  test.each([
    [2, 2, '200'],
    [2.1, 2, '210'],
    [-0.0000005, 2, '-0.00005'],
  ])('shiftRight-%#', (input, scale, result) => {
    expect(shiftRight(input, scale)).toBe(result);
  });
});

describe('toString', () => {
  test.each([
    [2.34, '2.34'],
    [-2.34, '-2.34'],
    [-0.0000005, '-0.0000005'],
  ])('toString-%#', (input, result) => {
    expect(convertString(input)).toBe(result);
  });
});

describe('toFixed', () => {
  test.each([
    [1.45, 1, '1.5'],
    [1.005, 2, '1.01'],
  ])('toFixed-%#', (input, scale, result) => {
    expect(toFixed(input, scale)).toBe(result);
  });
});

describe('trimZero', () => {
  test.each([
    ['01.450', '1.45'],
    ['-01.0050', '-1.005'],
  ])('trimZero-%#', (input, result) => {
    expect(trimZero(input)).toBe(result);
  });
});

describe('isBetween', () => {
  test.each([
    [2, 1, 3, undefined, true],
    [2, 2, 2, { boundary: '[]' } as CompareOption, true],
    [2, 2, 3, { boundary: '[)' } as CompareOption, true],
    [2, 1, 2, { boundary: '(]' } as CompareOption, true],
    [2, 1, 2, undefined, false],
    [2, 2, 3, { boundary: '(]' } as CompareOption, false],
  ])('isBetween-%#', (input, min, max, option, result) => {
    expect(isBetween(input, min, max, option)).toBe(result);
  });
});

describe('sum', () => {
  test.each([
    [[1], 1],
    [[1, 2], 3],
    [[1, 2, 3, 4], 10],
  ])('sum-%#', (input, result) => {
    expect(sum(...input)).toBe(result);
  });
});

describe('avg', () => {
  test.each([
    [[1], 1],
    [[1, 2], 1.5],
    [[1, 2, 3, 4], 2.5],
  ])('avg-%#', (input, result) => {
    expect(avg(...input)).toBe(result);
  });
});

describe('toThousand', () => {
  test.each([
    [23412563.26, undefined, '23,412,563.26'],
    ['0023412563.26', undefined, '0,023,412,563.26'],
    ['0023412563.26', { native: { style: 'currency' as const, currency: 'CNY' } }, 'CN¥23,412,563.26'],
    ['-0023412563.26', { trim: true }, '-23,412,563.26'],
    [-3412563.26, undefined, '-3,412,563.26'],
  ])('toThousand-%#', (input, option, result) => {
    expect(toThousand(input, option)).toBe(result);
  });
});

describe('divide', () => {
  test.each([
    [23, 4, [5, 3]],
    [16, 4, [4, 0]],
    [2, 4, [0, 2]],
    [-5, 3, [-1, -2]],
  ])('divide-%#', (dividend, divisor, result) => {
    expect(divide(dividend, divisor)).toEqual(result);
  });
});
