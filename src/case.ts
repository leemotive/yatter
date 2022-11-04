import { intReg } from './reg';

const numberWordReg = /\d+/g;
const CapNumReg = /[A-Z]+\d[a-z\d]*/g;
const CapLowerReg = /[A-Z][a-z][a-z\d]*/g;
const CapWordReg = /[A-Z]+/g;
const lowNumReg = /[a-z\d]+/g;

const defaultWordReg = [CapNumReg, CapLowerReg, CapWordReg, lowNumReg, numberWordReg];
const defaultTrimReg = /[^a-z\d]+/i;

export type CapitalBelongEnum = 'left' | 'right' | 'combine';
export type CaseOption = { delimiter?: string; phrases?: string[]; trimReg?: RegExp } & (
  | { wordReg?: OneOrMore<RegExp>; number?: never; capitalBelong?: never }
  | { wordReg?: never; number?: boolean; capitalBelong?: CapitalBelongEnum }
);
function parseChunks<T extends CaseOption>(input: string, option: T = {} as T): string[] {
  let { trimReg = defaultTrimReg, wordReg = defaultWordReg, number = false, capitalBelong = 'right' } = option;

  if (!Array.isArray(wordReg)) {
    wordReg = [wordReg];
  }

  if (option.number !== undefined || option.capitalBelong !== undefined) {
    wordReg = [];
    if (number) {
      wordReg.unshift(numberWordReg);
    }
    if (capitalBelong === 'left') {
      wordReg.push(/[A-Z]{2,}\d*/g, /[A-Z]?[a-z\d]+/g);
    } else if (capitalBelong === 'combine') {
      wordReg.push(/[A-Z]*[a-z\d]+/g);
    } else if (capitalBelong === 'right') {
      wordReg.push(...defaultWordReg.slice(0, -1));
    }
  }

  type ChunkArray = Array<string | { word: string }>;
  const resultInChunk = wordReg
    .reduce(
      (chunks, reg) =>
        chunks
          .map(chunk => {
            if (typeof chunk !== 'string') {
              return [chunk];
            }
            const matches = [...chunk.matchAll(reg)];
            const words: ChunkArray = [];
            let endIndex = 0;
            matches.forEach(({ index: startIndex, 0: word }) => {
              if (endIndex < (startIndex as number)) {
                words.push(chunk.slice(endIndex, startIndex));
              }
              words.push({ word });

              endIndex = <number>startIndex + word.length;
            });
            if (endIndex < chunk.length) {
              words.push(chunk.slice(endIndex));
            }
            return words;
          })
          .flat(),
      [input] as ChunkArray,
    )
    .map(chunk => (typeof chunk === 'string' ? chunk : chunk.word))
    .filter(chunk => !trimReg.test(chunk));

  return resultInChunk;
}

/**
 * 去除特殊分割，全小写。用指定的符号连接，默认使用空格连接
 * @param args
 * @returns
 */
export function toNoneCase(...args: Parameters<typeof parseChunks>): string {
  // return args[0];
  const chunks = parseChunks(...args);

  const { delimiter = ' ' } = args[1] || {};

  return chunks.map(chunk => chunk.toLowerCase()).join(delimiter);
}

/**
 * 转帕斯卡格式(大驼峰格式)
 * @param input
 * @param option
 * @returns
 */
export function toPascalCase(input: string, option: { numDelimiter?: string } & CaseOption = {}): string {
  const { numDelimiter = '_' } = option;
  return parseChunks(input, option)
    .map((chunk, index) => {
      const cased = `${chunk[0].toUpperCase()}${chunk.slice(1).toLowerCase()}`;
      if (!numDelimiter || !intReg.test(chunk[0]) || !index) {
        return cased;
      }
      return `${numDelimiter}${cased}`;
    })
    .join('');
}

/**
 * 转小驼峰格式
 * @param args
 * @returns
 */
export function toCamelCase(...args: Parameters<typeof toPascalCase>): string {
  const cased = toPascalCase(...args);
  if (!/[A-Z]/.test(cased[0])) {
    return cased;
  }
  return `${cased[0].toLowerCase()}${cased.slice(1)}`;
}

/**
 * 转中横线格式
 * @param args
 * @returns
 */
export function toKebabCase(...args: Parameters<typeof parseChunks>): string {
  const chunks = parseChunks(...args);
  return chunks.map(chunk => chunk.toLowerCase()).join('-');
}

/**
 * 转下划线格式
 * @param args
 * @returns
 */
export function toSnakeCase(...args: Parameters<typeof parseChunks>): string {
  const chunks = parseChunks(...args);
  return chunks.map(chunk => chunk.toLowerCase()).join('_');
}

/**
 * 转大写下划线连接格式，一般为常量名的格式
 * @param args
 * @returns
 */
export function toConstantCase(...args: Parameters<typeof parseChunks>) {
  const chunks = parseChunks(...args);
  return chunks.map(chunk => chunk.toUpperCase()).join('_');
}

/**
 * 转小写斜线连接
 * @param args
 * @returns
 */
export function toPathCase(...args: Parameters<typeof parseChunks>) {
  const chunks = parseChunks(...args);
  return chunks.map(chunk => chunk.toLowerCase()).join('/');
}

/**
 * 转英文句子格式，句首大写，其余小写，空格连接
 * @param args
 * @returns
 */
export function toSentenseCase(...args: Parameters<typeof toNoneCase>) {
  const cased = toNoneCase(...args);
  if (!cased) {
    return cased;
  }
  return `${cased[0].toUpperCase()}${cased.slice(1)}`;
}
