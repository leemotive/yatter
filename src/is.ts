export type NotFunction<T> = T extends AnyFunction ? never : T;
export type TestFunction<I> = (input: I) => boolean;
export type Matcher<I, F> = TestFunction<I> | NotFunction<F>;

/**
 * 判断参数一能否和参数二的条件相匹配
 * @param input 被匹配的元素
 * @param matcher 条件
 * @returns 是否匹配成功
 */
export function isMatch<I, T>(input: I, matcher: Matcher<I, T>): boolean {
  if (matcher instanceof RegExp && typeof input === 'string') {
    return matcher.test(input);
  }

  if (typeof matcher === 'function') {
    return (matcher as TestFunction<I>)(input);
  }

  return input === matcher;
}

/**
 * 判断参数一数组中是否有元素能够和参数二的条件相匹配
 * @param inputs
 * @param matcher
 * @returns
 */
export function isSomeMatch<I, T>(inputs: I[], matcher: Matcher<I, T>): boolean {
  return inputs.some(input => isMatch(input, matcher));
}

/**
 * 判断参数一数组中的元素是否都能否和参数二的条件相匹配
 * @param inputs
 * @param matcher
 * @returns
 */
export function isAllMatch<I, T>(inputs: I[], matcher: Matcher<I, T>): boolean {
  return inputs.every(input => isMatch(input, matcher));
}

/**
 * 判断参数一是否能匹配参数二中的某个条件
 * @param input
 * @param matchers
 * @returns
 */
export function isMatchSome<I, T>(input: I, matchers: Matcher<I, T>[]): boolean {
  return matchers.some(matcher => isMatch(input, matcher));
}

/**
 * 判断参数一是否能匹配参数二中的所有条件
 * @param input
 * @param matchers
 * @returns
 */
export function isMatchAll<I, T>(input: I, matchers: Matcher<I, T>[]): boolean {
  return matchers.every(matcher => isMatch(input, matcher));
}

/**
 * 判断参数是否是空字符串，空数组，空对象
 * @param input
 * @returns
 */
export function isEmpty(input: object | string): boolean {
  if (!input || typeof input === 'string') {
    return !input;
  }
  if (Array.isArray(input)) {
    return !input.length;
  }
  return !Object.keys(input).length;
}

/**
 * 判断是参数字符串是否只包含空白字符
 * @param input
 * @returns
 */
export function isBlank(input: string) {
  return !input?.trim();
}

/**
 * 判断参数数组中的元素是否都相同
 * @param inputs
 * @returns
 */
export function isAllSame(inputs: unknown[]): boolean {
  return isAllMatch(inputs, inputs[0]);
}
