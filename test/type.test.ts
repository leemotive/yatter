import { describe, expect, test } from 'vitest';
// eslint-disable-next-line max-classes-per-file
import { isAsyncFunction, isBuiltInFunction, isFunction, isPlainObject, isSameType, isType } from '../src/type';

describe('isFunction', () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const fun = () => {};
  test.each([
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [function f() {}, true],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [async function ff() {}, true],
    [fun, true],
    [1, false],
  ])('isFunction-%#', (input, result) => {
    expect(isFunction(input)).toBe(result);
  });
});

describe('isAsyncFunction', () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const fun = async () => {};
  test.each([
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [function f() {}, false],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [async function ff() {}, true],
    [fun, true],
    [1, false],
  ])('isAsyncFunction-%#', (input, result) => {
    expect(isAsyncFunction(input)).toBe(result);
  });
});

describe('isPlainObject', () => {
  test.each([
    [{}, true],
    [Object.create(null), true],
    [[], false],
    [1, false],
    [new (class A {})(), false],
    [Object, false],
  ])('isPlainObject-%#', (input, result) => {
    expect(isPlainObject(input)).toBe(result);
  });
});

describe('isSameType', () => {
  class B {}
  test.each([
    [1, 2, true],
    ['a', 'b', true],
    [false, true, true],
    [1, /1/, false],
    [null, null, true],
    [undefined, null, false],
    [[], {}, false],
    [new B(), new B(), true],
  ])('isSameType-%#', (input, match, result) => {
    expect(isSameType(input, match)).toBe(result);
  });
});

describe('isType', () => {
  class C {}
  test.each([
    [1, 'number', true],
    [2, Number, true],
    [1, String, false],
    ['a', String, true],
    [undefined, undefined, true],
    [null, null, true],
    [new C(), C, true],
    [{}, 'object', true],
    [/1/, RegExp, true],
  ])('isType-%#', (input, type, result) => {
    expect(isType(input, type)).toBe(result);
  });
});

describe('isBuiltInFunction', () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const ac = () => {};
  test.each([
    [Math.max, true],
    [class D {}, false],
    [Object, true],
    [Function.prototype, true],
    [ac, false],
  ])('isBuiltInFunction-%#', (input, result) => {
    // @ts-expect-error 不是函数不影响
    expect(isBuiltInFunction(input)).toBe(result);
  });
});
