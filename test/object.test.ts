import { Matcher } from '../src/is';
import { cut, pick, emptyOf, clone, filter, invert, getDeepValue, setDeepValue } from '../src/object';

describe('pick', () => {
  const obj = { id: 1, name: 'a' };
  test.each([
    [obj, ['id', ['name', 'nickname']] as Array<keyof typeof obj>, { id: 1, nickname: 'a' }],
    [obj, [/m/, { from: 'id', to: 'no' }], { no: 1, name: 'a' }],
    [obj, [/m/, { from: /i/, to: (a: string) => a.repeat(2) }], { idid: 1, name: 'a' }],
    [obj, [(k: keyof typeof obj) => obj[k] === 'a'], { name: 'a' }],
  ])('string-%#', (input, matcher, result) => {
    expect(pick(input, matcher)).toEqual(result);
  });
});

describe('cut', () => {
  test.each([
    [{ id: 1, name: 'a' }, ['id'], { name: 'a' }],
    [{ id: 1, name: 'a' }, [/n/, (k: string) => k === 'id'], {}],
  ])('cut-%#', (input, matcher: Matcher<string, AnyFunction | string | RegExp>[], result) => {
    expect(cut(input, matcher)).toEqual(result);
  });
});

describe('emptyOf', () => {
  test.each([
    [{ name: 'a' }, {}],
    [[1], []],
    ['sfd', 'sfd'],
  ])('emptyOf-%#', (input, result) => {
    expect(emptyOf(input)).toEqual(result);
  });
});

describe('clone', () => {
  test('clone-cirlce', () => {
    const circleObj: { [K: string]: unknown } = {};
    circleObj.circle = circleObj;
    const cloned = clone(circleObj);
    expect(cloned.circle).toBe(cloned);
  });

  test('clone-shollow', () => {
    const arr = [
      { a: 1, b: ['12', { c: 34 }] },
      { a: 1, b: ['12', { c: 34 }] },
    ];
    const cloned = clone(arr, 'shallow');
    expect(cloned).toEqual([
      { a: 1, b: ['12', { c: 34 }] },
      { a: 1, b: ['12', { c: 34 }] },
    ]);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(cloned[0].b[1]).toBe(arr[0].b[1]);
  });

  test('clone-deep', () => {
    const arr = [{ a: 1, b: ['12', { c: 34 }] }, undefined, { c: undefined, b: null }];
    expect(clone(arr)).toEqual([{ a: 1, b: ['12', { c: 34 }] }, undefined, { c: undefined, b: null }]);
  });

  test('clone-json', () => {
    const arr = [{ a: 1, b: ['12', { c: 34 }] }, undefined, { c: undefined, b: null }];
    expect(clone(arr, 'json')).toEqual([{ a: 1, b: ['12', { c: 34 }] }, null, { b: null }]);
  });
});

describe('filter', () => {
  const obj = { name: 'jane', age: 34, child: [{ k: 34 }, { n: '34' }] };

  function matcher([key, value]: [string | number, unknown]) {
    if (/n|\d/.test(key as string)) {
      return true;
    }
    if (Array.isArray(value)) {
      return true;
    }
    return false;
  }
  test('filter-normal', () => {
    expect(filter(obj, ([key]) => /n/.test(key as string))).toEqual({ name: 'jane' });
  });
  test('filter-child-reserve', () => {
    expect(filter(obj, matcher, { deep: true })).toEqual({ name: 'jane', child: [{}, { n: '34' }] });
  });
  test('filter-child-trim', () => {
    expect(filter(obj, matcher, { deep: true, empty: 'trim' })).toEqual({ name: 'jane', child: [{ n: '34' }] });
  });
});

describe('invert', () => {
  test.each([
    [{ a: 1, b: 2 }, undefined, { 1: 'a', 2: 'b' }],
    [{ a: 1, b: 2, c: 1 }, { duplicate: 'overwrite' }, { 1: 'c', 2: 'b' }],
    [{ a: 1, b: 2, c: 1 }, { duplicate: 'concat' }, { 1: ['a', 'c'], 2: 'b' }],
  ])('invert-%#', (input, option, result) => {
    // @ts-expect-error 字符串格枚举
    expect(invert(input, option)).toEqual(result);
  });
});

describe('getDeepvalue', () => {
  test.each([
    [{ a: [{ b: 1 }] }, 'a[0].b', undefined, 1, { a: [{ b: 1 }] }],
    [{ a: 1 }, 'c.b', undefined, undefined, { a: 1 }],
    [{ a: 1 }, 'c.b', { create: false, mount: true, fallback: 4 }, 4, { a: 1, c: { b: 4 } }],
    [{ a: 1 }, 'c.b', { create: true }, undefined, { a: 1, c: {} }],
    [{ a: 1 }, 'c[1].b', { create: true }, undefined, { a: 1, c: [undefined, {}] }],
  ])('getDeepvalue-%#', (input, key, option, value, obj) => {
    expect(getDeepValue(input, key, option)).toEqual(value);
    expect(input).toEqual(obj);
  });
});

describe('setDeepvalue', () => {
  test.each([
    [{ a: [{ b: 1 }] }, 'a[0].b', 4, undefined, true, { a: [{ b: 4 }] }],
    [{ a: 1 }, 'c.b', 4, undefined, true, { a: 1, c: { b: 4 } }],
    [{ a: 1 }, 'c.b', 4, { create: false }, false, { a: 1 }],
    [{ a: 1 }, 'a.b', 4, undefined, false, { a: 1 }],
    [{ a: 1 }, 'b[0]', 4, undefined, true, { a: 1, b: [4] }],
    [{ a: 1 }, 'c[1].b', 4, { create: true }, true, { a: 1, c: [undefined, { b: 4 }] }],
  ])('setDeepvalue-%#', (input, key, value, option, result, obj) => {
    expect(setDeepValue(input, key, value, option)).toEqual(result);
    expect(input).toEqual(obj);
  });
});
