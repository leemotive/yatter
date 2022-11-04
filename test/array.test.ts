import { cross, groupBy, max, min, parallel, sorter, unique } from '../src/array';

describe('sorter', () => {
  const arr = [
    { a: 1, b: 5 },
    { a: 3, b: 4 },
    { a: 1, b: 4 },
  ];
  test('sorter-0', () => {
    expect(arr.slice().sort(sorter(ele => [ele.a, ele.b], 'asc'))).toEqual([arr[2], arr[0], arr[1]]);
  });

  test('sorter-1', () => {
    expect(arr.slice().sort(sorter(ele => [ele.b, ele.a], ['asc', 'desc']))).toEqual([arr[1], arr[2], arr[0]]);
  });
});

describe('max-min', () => {
  const input1 = [{ id: 1 }, { id: 5 }, { id: 3 }];
  test('max-1', () => {
    expect(max(input1, 'id')).toBe(input1[1]);
  });

  const input2 = [
    { id: 1, no: 3 },
    { id: 5, no: 1 },
    { id: 3, no: 0 },
  ];
  test('max-2', () => {
    expect(max(input2, ele => ele.id + ele.no)).toBe(input2[1]);
  });

  test('min-1', () => {
    expect(min(input1, 'id')).toBe(input1[0]);
  });

  test('min-2', () => {
    expect(min(input2, ele => ele.id + ele.no)).toBe(input2[2]);
  });
});

describe('unique', () => {
  const arr = [
    { a: 1, b: 5 },
    { a: 1, b: 4 },
    { a: 2, b: 4 },
  ];
  test('unique-0', () => {
    expect(unique(arr, ele => ele.a)).toEqual([arr[0], arr[2]]);
  });

  test('unique-1', () => {
    expect(unique(arr, 'b')).toEqual([arr[0], arr[1]]);
  });

  test('unique-2', () => {
    expect(unique(arr, ele => ele.b + ele.a)).toEqual([arr[0], arr[1]]);
  });

  test('unique-2', () => {
    expect(unique([1, 3, 4, 6, 1, 4])).toEqual([1, 3, 4, 6]);
  });
});

describe('groupBy', () => {
  const list = [
    { id: 1, name: '张三' },
    { id: 2, name: '张猫' },
    { id: 2, name: '王五' },
  ];
  test.each([
    [list, 'id', { 1: list.slice(0, 1), 2: list.slice(1) }],
    [
      list,
      (item: typeof list extends Array<infer R> ? R : never) => item.name[0],
      { 张: list.slice(0, 2), 王: list.slice(2) },
    ],
  ])('groupBy-%#', (input, key, result) => {
    expect(groupBy(input, key as never)).toEqual(result);
  });
});

describe('parallel', () => {
  test.each([
    [
      [
        [2, 3],
        ['a', 'b'],
      ],
      [
        [2, 'a'],
        [3, 'b'],
      ],
    ],
    [
      [
        [2, 3],
        [{}, undefined, 'c'],
        [true, 4, false],
      ],
      [
        [2, {}, true],
        [3, undefined, 4],
        [undefined, 'c', false],
      ],
    ],
  ])('parallel-%#', (input, result) => {
    expect(parallel(...input)).toEqual(result);
  });
});

describe('cross', () => {
  test.each([
    [
      [1, 2],
      [3, 4],
      [1, 3, 2, 4],
    ],
    [
      [1, 2, 6],
      [3, 4],
      [1, 3, 2, 4, 6],
    ],
    [
      [1, 2],
      [3, 4, 5],
      [1, 3, 2, 4, 5],
    ],
  ])('cross-%#', (a, b, result) => {
    expect(cross(a, b)).toEqual(result);
  });
});
