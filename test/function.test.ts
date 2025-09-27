import { beforeEach, describe, expect, test, vi } from 'vitest';
import { isNullOrUndef } from '../src';
import { bindArgs, debounce, defaultIf, isNot, limitArgs, once, poll, retry, throttle } from '../src/function';

beforeEach(() => {
  vi.useFakeTimers();
});

describe('debounce', () => {
  test('leading: true, trailing: true', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 1000, { leading: true, trailing: true });
    debounced(12);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(12);
    vi.advanceTimersByTime(500);
    debounced(13);
    debounced(14);
    vi.advanceTimersByTime(501);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).not.toHaveBeenCalledWith(13);
    expect(fn).toHaveBeenCalledWith(14);
    vi.clearAllTimers();
  });
  test('leading: false, trailing: true', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 1000, { leading: false, trailing: true });
    debounced(12);
    debounced(14);
    expect(fn).not.toBeCalled();
    vi.advanceTimersByTime(1001);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(14);
    vi.clearAllTimers();
  });

  test('leading: true, trailing: false', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 1000, { leading: false, trailing: true });
    debounced(12);
    expect(fn).not.toBeCalled();
    vi.advanceTimersByTime(1001);
    expect(fn).toBeCalled();
    expect(fn).toHaveBeenCalledTimes(1);
    vi.clearAllTimers();
  });

  test('leading: false, trailing: false', () => {
    const fn = vi.fn();
    // @ts-expect-error 测试异常，忽略此处错误
    expect(() => debounce(fn, 1000, { leading: false, trailing: false })).toThrowError();
  });
});

describe('throttle', () => {
  test('leading: true, trailing: true', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000, { leading: true, trailing: true });
    throttled(12);
    expect(fn).toHaveBeenCalledWith(12);
    vi.advanceTimersByTime(500);
    throttled(13);
    throttled(14);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(501);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(14);
    vi.clearAllTimers();
  });

  test('leading: true, trailing: false', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000, { leading: true, trailing: false });
    throttled(12);
    expect(fn).toHaveBeenCalledWith(12);
    vi.advanceTimersByTime(500);
    throttled(13);
    throttled(14);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(501);
    expect(fn).toHaveBeenCalledTimes(1);
    throttled(15);
    throttled(16);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(15);
    vi.advanceTimersByTime(2000);
    expect(fn).not.toHaveBeenCalledWith(16);
    vi.clearAllTimers();
  });

  test('leading: false, trailing: true', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000, { leading: false, trailing: true });
    throttled(12);
    expect(fn).not.toBeCalled();
    vi.advanceTimersByTime(500);
    throttled(13);
    throttled(14);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(501);
    expect(fn).toHaveBeenLastCalledWith(14);
    throttled(15);
    throttled(16);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1001);
    expect(fn).toHaveBeenLastCalledWith(16);
    vi.clearAllTimers();
  });

  test('leading: false, trailing: false', () => {
    const fn = vi.fn();
    // @ts-expect-error 测试异常，忽略此处错误
    expect(() => throttle(fn, 1000, { leading: false, trailing: false })).toThrowError();
  });
});

describe('once', () => {
  test('lastResult: false', () => {
    const fn = vi.fn().mockReturnValue(2);
    const onceFn = once(fn, { lastResult: false });

    let f = onceFn(12);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(12);
    expect(f).toBe(2);
    f = onceFn(13);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(f).toBeUndefined();
    vi.clearAllTimers();
  });

  test('lastResult: true', () => {
    const fn = vi.fn().mockReturnValue(2);
    const onceFn = once(fn);

    let f = onceFn(12);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(12);
    expect(f).toBe(2);
    f = onceFn(13);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(f).toBe(2);
    vi.clearAllTimers();
  });
});

describe('retry', () => {
  test('exceeded times', async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const fn = vi.fn(async () => {
      throw Error('exceeded');
    });
    await expect(retry(fn)).rejects.toThrowError('exceeded');
    expect(fn).toHaveBeenCalledTimes(3);
    vi.clearAllTimers();
  });

  test('success', async () => {
    let times = 1;
    // eslint-disable-next-line @typescript-eslint/require-await
    const fn = vi.fn(async () => {
      if (times < 2) {
        times++;
        throw Error(String(times));
      }
      return times;
    });
    const result = await retry(fn)();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toBe(2);
    vi.clearAllTimers();
  });
});

describe('poll', () => {
  test('normal', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const stop = poll(fn)();
    expect(fn).toHaveBeenCalledTimes(1);
    await vi.advanceTimersToNextTimerAsync();
    expect(fn).toHaveBeenCalledTimes(2);
    await vi.advanceTimersToNextTimerAsync();
    expect(fn).toHaveBeenCalledTimes(3);
    stop();
    await vi.advanceTimersToNextTimerAsync();
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('isNot', () => {
  test('not', () => {
    function callback(a: number) {
      return a > 2;
    }
    expect(isNot(callback)(1)).toBe(true);
    expect(isNot(callback)(3)).toBe(false);
  });
});

describe('limitArgs', () => {
  test('limitArgs', () => {
    function callback(a: number, b = 6) {
      return a + b;
    }
    expect(limitArgs(callback)(1, 8)).toBe(7);
  });
});

describe('bindArgs', () => {
  test('bindArgs', () => {
    function callback(a: number, b = 6) {
      return a + b;
    }
    expect(bindArgs(callback, bindArgs.HOLDER, 2)(8)).toBe(10);
  });
});

describe('defaultIf', () => {
  test.each([
    [undefined, undefined, 'default'],
    [Number.NaN, Number.NaN, 'default'],
    ['', '', 'default'],
    [null, isNullOrUndef, 'default'],
  ])('default-%#', (...args) => {
    // @ts-expect-error 类型不管
    expect(defaultIf(...args)).toEqual(args.at(-1));
  });

  test.each([
    [undefined, null, 'default'],
    ['ab', Number.NaN, 'default'],
    ['ab', isNullOrUndef, 'default'],
  ])('value-%#', (...args) => {
    // @ts-expect-error 类型不管
    expect(defaultIf(...args)).toEqual(args.at(0));
  });
});
