import { cross } from './array';
import { numberNoSignReg } from './reg';

const entityChar: string[] = ['<', '>', '&', "'", '"'];
const entiryCode: string[] = ['&lt;', '&gt;', '&amp;', '&apos;', '&quot;'];
/**
 * 将 <>&'" 几个符号转成 html entity 形式
 * @param input
 * @param codes
 * @returns
 */
export function escapeEntity(input: string, codes = '<>&\'"') {
  const reg = new RegExp(`[${codes}]`, 'g');
  return input.replace(reg, c => entiryCode[entityChar.indexOf(c)]);
}

/**
 * 将 <>&'" 几个符号的 html entity 形式转回原字符
 * @param input
 * @param codes
 * @returns
 */
export function unescapeEntity(input: string, codes = '<>&\'"') {
  const reg = new RegExp(
    Array.from(codes)
      .map(c => entiryCode[entityChar.indexOf(c)])
      .join('|'),
    'g',
  );
  return input.replace(reg, c => entityChar[entiryCode.indexOf(c)]);
}

/**
 * 随机产生一个字符串
 * @returns
 */
export function uid(): string {
  const tid = Date.now().toString(36);
  const rid = Math.random().toString(36).slice(2);
  return cross([...tid].reverse(), [...rid]).join('');
}

/**
 * css 中拼接数值和单位，如果数值部分为0，将不拼接单位
 * @param value
 * @param unit
 * @returns
 */
export function joinUnit(value: number, unit: string): string {
  if (!numberNoSignReg.test(String(value))) {
    return String(value);
  }
  if (+value === 0) {
    return '0';
  }
  return `${value}${unit}`.replace(/^0*/, '');
}

/**
 * 比较两个字符串是否相同，不考虑大小写情况
 * @param o 第一个比较字符串
 * @param c 第二个比较字符串
 * @returns 是否相等
 */
export function equalsIgnoreCase(o?: string, c?: string): boolean {
  if (o === c) {
    return true;
  }
  return o?.toLowerCase() === c?.toLowerCase();
}
