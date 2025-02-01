import { describe, expect, test } from 'vitest';
import { isEmpty } from '../src/is';

describe('isEmtpy', () => {
  test.each([
    [{}, true],
    [[], true],
    ['', true],
    [' ', false],
    [['a'], false],
    [{ a: 1 }, false],
  ])('isEmpty-%#', (input, result) => {
    expect(isEmpty(input)).toBe(result);
  });
});
