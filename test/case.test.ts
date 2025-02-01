import { describe, expect, test } from 'vitest';
import {
  type CapitalBelongEnum,
  toCamelCase,
  toConstantCase,
  toKebabCase,
  toNoneCase,
  toPascalCase,
  toPathCase,
  toSentenseCase,
  toSnakeCase,
} from '../src/case';

describe('toPascalCase', () => {
  test.each([
    ['', ''],
    ['test', 'Test'],
    ['test string', 'TestString'],
    ['Test String', 'TestString'],
    ['TestV2', 'TestV2'],
    ['version 1.2.10', 'Version_1_2_10'],
    ['version 1.21.0', 'Version_1_21_0'],
  ])('toPascalCase-%#', (input, result) => {
    expect(toPascalCase(input)).toBe(result);
  });

  test.each([['version 1.21.0', 'Version1210', { numDelimiter: '' }]])(
    'toPascalCaseWithOption-%#',
    (input, result, option) => {
      expect(toPascalCase(input, option)).toBe(result);
    },
  );
});

describe('toCamelCase', () => {
  test.each([
    ['', ''],
    ['test', 'test'],
    ['test string', 'testString'],
    ['Test String', 'testString'],
    ['TestV2', 'testV2'],
    ['_foo_bar_', 'fooBar'],
    ['version 1.2.10', 'version_1_2_10'],
    ['version 1.21.0', 'version_1_21_0'],
  ])('toCamelCase-%#', (input, result) => {
    expect(toCamelCase(input)).toBe(result);
  });

  test.each([['version 1.2.10', 'version1210', { numDelimiter: '' }]])(
    'toCamelCaseWithOption-%#',
    (input, result, option) => {
      expect(toCamelCase(input, option)).toBe(result);
    },
  );
});

describe('toKebabCase', () => {
  test.each([
    ['', ''],
    ['test', 'test'],
    ['test string', 'test-string'],
    ['Test String', 'test-string'],
    ['TestV2', 'test-v2'],
    ['version 1.2.10', 'version-1-2-10'],
    ['version 1.21.0', 'version-1-21-0'],
  ])('toKebabCase-%#', (input, result) => {
    expect(toKebabCase(input)).toBe(result);
  });
});

describe('toSnakeCase', () => {
  test.each([
    ['', ''],
    ['_id', 'id'],
    ['test', 'test'],
    ['test string', 'test_string'],
    ['Test String', 'test_string'],
    ['TestV2', 'test_v2'],
    ['version 1.2.10', 'version_1_2_10'],
    ['version 1.21.0', 'version_1_21_0'],
  ])('toSnakeCase-%#', (input, result) => {
    expect(toSnakeCase(input)).toBe(result);
  });
});

describe('toConstantCase', () => {
  test.each([
    ['', ''],
    ['test', 'TEST'],
    ['test string', 'TEST_STRING'],
    ['Test String', 'TEST_STRING'],
    ['dot.case', 'DOT_CASE'],
    ['path/case', 'PATH_CASE'],
    ['TestV2', 'TEST_V2'],
    ['version 1.2.10', 'VERSION_1_2_10'],
    ['version 1.21.0', 'VERSION_1_21_0'],
  ])('toConstantCase-%#', (input, result) => {
    expect(toConstantCase(input)).toBe(result);
  });
});

describe('toPathCase', () => {
  test.each([
    ['', ''],
    ['test', 'test'],
    ['test string', 'test/string'],
    ['Test String', 'test/string'],
    ['TestV2', 'test/v2'],
    ['version 1.2.10', 'version/1/2/10'],
    ['version 1.21.0', 'version/1/21/0'],
  ])('toPathCase-%#', (input, result) => {
    expect(toPathCase(input)).toBe(result);
  });
});

describe('toSentenseCase', () => {
  test.each([
    ['', ''],
    ['test', 'Test'],
    ['test string', 'Test string'],
    ['Test String', 'Test string'],
    ['TestV2', 'Test v2'],
    ['version 1.2.10', 'Version 1 2 10'],
    ['version 1.21.0', 'Version 1 21 0'],
  ])('toSentenseCase-%#', (input, result) => {
    expect(toSentenseCase(input)).toBe(result);
  });
});

describe('toNoneCase', () => {
  test.each([
    ['test', 'test'],
    ['TEST', 'test'],
    ['123s', '123s'],

    // Camel case.
    ['testString', 'test string'],
    ['testString123', 'test string123'],
    ['testString_1_2_3', 'test string 1 2 3'],
    ['x_256', 'x 256'],
    ['anHTMLTag', 'an html tag'],
    ['ID123String', 'id123 string'],
    ['Id123String', 'id123 string'],
    ['foo bar123', 'foo bar123'],
    ['a1bStar', 'a1b star'],

    // Constant case.
    ['CONSTANT_CASE ', 'constant case'],
    ['CONST123_FOO', 'const123 foo'],

    // Random cases.
    ['FOO_bar', 'foo bar'],
    ['XMLHttpRequest', 'xml http request'],
    ['IQueryAArgs', 'i query a args'],

    // Non-alphanumeric separators.
    ['dot.case', 'dot case'],
    ['path/case', 'path case'],
    ['snake_case', 'snake case'],
    ['snake_case123', 'snake case123'],
    ['snake_case_123', 'snake case 123'],

    // Punctuation.
    ['"quotes"', 'quotes'],

    // Space between number parts.
    ['version 0.45.0', 'version 0 45 0'],
    ['version 0..78..9', 'version 0 78 9'],
    ['version 4_99/4', 'version 4 99 4'],

    // Whitespace.
    ['  test  ', 'test'],

    // Number string input.
    ['something_2014_other', 'something 2014 other'],

    // https://github.com/blakeembrey/change-case/issues/21
    ['amazon s3 data', 'amazon s3 data'],
    ['foo_13_bar', 'foo 13 bar'],
  ])('toNoneCase-%#', (input, result) => {
    expect(toNoneCase(input)).toBe(result);
  });

  test.each([
    ['camel2019', 'camel 2019', { number: true }],
    ['minifyURLs', 'minify urls', { capitalBelong: 'combine' as CapitalBelongEnum }],
    ['minifyURLsJs', 'minify url s js', { capitalBelong: 'left' as CapitalBelongEnum }],
    ['minifyURLs', 'minify ur ls', { capitalBelong: 'right' as CapitalBelongEnum }],
  ])('toNoneCaseWithOption-%#', (input, result, option?) => {
    expect(toNoneCase(input, option)).toBe(result);
  });
});
