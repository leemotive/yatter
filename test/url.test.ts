import { describe, expect, test } from 'vitest';
import { appendParam, getParam, normalizeParam, param2Search, restoreParam, search2Param } from '../src/url';

describe('appendParam', () => {
  test.each([
    ['http://leeup.top', 'name=leeup&type=1', 'http://leeup.top/?name=leeup&type=1'],
    ['http://leeup.top', { name: 'leeup', type: 1 }, 'http://leeup.top/?name=leeup&type=1'],
  ])('appendParam-%#', (input, param, result) => {
    expect(appendParam(input, param)).toBe(result);
  });
});

describe('getParam', () => {
  test.each([
    ['http://leeup.top?name=leeup&amount=-1.2', undefined, { name: 'leeup', amount: '-1.2' }],
    [
      'http://leeup.top?name=leeup&amount=-1.2&top=true&bottom=false&start=null&from=undefined',
      { changeType: true },
      { name: 'leeup', amount: -1.2, top: true, bottom: false, start: null, from: undefined },
    ],
  ])('getParam-%#', (input, option, result) => {
    expect(getParam(input, option)).toEqual(result);
  });
});

describe('search2Param', () => {
  test.each([
    ['name=zhang&age=34', undefined, { name: 'zhang', age: '34' }],
    ['name=zhang&age=34', { changeType: true }, { name: 'zhang', age: 34 }],
  ])('search2Param-%#', (input, option, result) => {
    expect(search2Param(input, option)).toEqual(result);
  });
});

describe('param2Search', () => {
  test.each([[{ name: 'zhang', age: undefined }, 'name=zhang']])('param2Search-%#', (input, result) => {
    expect(param2Search(input)).toBe(result);
  });
});

describe('normalizeParam', () => {
  test.each([
    [
      { fav: ['football', 'swimming'], sales: { price: 2, total: 40 } },
      undefined,
      { 'fav[0]': 'football', 'fav[1]': 'swimming', 'sales[price]': 2, 'sales[total]': 40 },
    ],
    [
      { fav: ['football', 'swimming'], sales: { price: 2, total: 40 } },
      { mode: 'json' },
      { fav: '["football","swimming"]', sales: '{"price":2,"total":40}' },
    ],
  ])('normalizeParam-%#', (input, option, result) => {
    // @ts-expect-error 参数 option
    expect(normalizeParam(input, option)).toEqual(result);
  });
});

describe('restoreParam', () => {
  test.each([
    ['a=1&b=2', undefined, { a: '1', b: '2' }],
    ['a[0]=1&b=2&a[1]=c', undefined, { a: ['1', 'c'], b: '2' }],
    ['a[0]=1&b=2&a[1]=c&b=4', { changeType: true }, { a: [1, 'c'], b: 4 }],
    ['a[0]=1&b[p]=02&a[1]=c', { changeType: true }, { a: [1, 'c'], b: { p: '02' } }],
    ['a=1&b[p]=9007199254740999&a=c', { changeType: true, merge: true }, { a: [1, 'c'], b: { p: '9007199254740999' } }],
  ])('restoreParam-%#', (input, option, result) => {
    expect(restoreParam(input, option)).toEqual(result);
  });
});
