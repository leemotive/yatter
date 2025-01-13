import { toKebabCase } from './case';

export function toCssVars(obj: object) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [`--${toKebabCase(key)}`, value]));
}
