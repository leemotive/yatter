import { equalsIgnoreCase, escapeEntity, joinUnit, uid, unescapeEntity } from '../src/string';

describe('escapeEntity', () => {
  test.each([
    ['<script>', undefined, '&lt;script&gt;'],
    ['<script type="text/javascript">', '<>', '&lt;script type="text/javascript"&gt;'],
  ])('escapeEntity-%#', (input, codes, result) => {
    expect(escapeEntity(input, codes)).toBe(result);
  });
});

describe('unescapeEntity', () => {
  test.each([
    ['&lt;script&gt;', undefined, '<script>'],
    ['&lt;script type="text/javascript"&gt;', '<>', '<script type="text/javascript">'],
  ])('unescapeEntity-%#', (input, codes, result) => {
    expect(unescapeEntity(input, codes)).toBe(result);
  });
});

test('uid', () => {
  expect(new Set(Array(1000).fill(0).map(uid)).size).toBe(1000);
});

describe('joinUnit', () => {
  test.each([
    [1, 'px', '1px'],
    [0, 'rem', '0'],
    [0.3, 's', '.3s'],
  ])('joinUnit-%#', (v, u, r) => {
    expect(joinUnit(v, u)).toBe(r);
  });
});

describe('equalsIgnoreCase', () => {
  test.each([
    [undefined, undefined, true],
    ['a', 'A', true],
    ['a', 'b', false],
  ])('equalsIgnoreCase-%#', (v, u, r) => {
    expect(equalsIgnoreCase(v, u)).toBe(r);
  });
});
