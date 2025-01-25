import { debounce, isNot, limitArgs, once, retry, throttle } from '../src/function';

jest.useFakeTimers();

describe('debounce', () => {
  test('leading: true, trailing: true', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 1000, { leading: true, trailing: true });
    debounced(12);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(12);
    jest.advanceTimersByTime(500);
    debounced(13);
    debounced(14);
    jest.advanceTimersByTime(501);
    expect(fn).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).not.toHaveBeenCalledWith(13);
    expect(fn).toHaveBeenCalledWith(14);
    jest.clearAllTimers();
  });
  test('leading: false, trailing: true', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 1000, { leading: false, trailing: true });
    debounced(12);
    debounced(14);
    expect(fn).not.toBeCalled();
    jest.advanceTimersByTime(1001);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(14);
    jest.clearAllTimers();
  });

  test('leading: true, trailing: false', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 1000, { leading: false, trailing: true });
    debounced(12);
    expect(fn).not.toBeCalled();
    jest.advanceTimersByTime(1001);
    expect(fn).toBeCalled();
    expect(fn).toHaveBeenCalledTimes(1);
    jest.clearAllTimers();
  });

  test('leading: false, trailing: false', () => {
    const fn = jest.fn();
    // @ts-expect-error 测试异常，忽略此处错误
    expect(() => debounce(fn, 1000, { leading: false, trailing: false })).toThrowError();
  });
});

describe('throttle', () => {
  test('leading: true, trailing: true', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 1000, { leading: true, trailing: true });
    throttled(12);
    expect(fn).toHaveBeenCalledWith(12);
    jest.advanceTimersByTime(500);
    throttled(13);
    throttled(14);
    expect(fn).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(501);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(14);
    jest.clearAllTimers();
  });

  test('leading: true, trailing: false', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 1000, { leading: true, trailing: false });
    throttled(12);
    expect(fn).toHaveBeenCalledWith(12);
    jest.advanceTimersByTime(500);
    throttled(13);
    throttled(14);
    expect(fn).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(501);
    expect(fn).toHaveBeenCalledTimes(1);
    throttled(15);
    throttled(16);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(15);
    jest.advanceTimersByTime(2000);
    expect(fn).not.toHaveBeenCalledWith(16);
    jest.clearAllTimers();
  });

  test('leading: false, trailing: true', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 1000, { leading: false, trailing: true });
    throttled(12);
    expect(fn).not.toBeCalled();
    jest.advanceTimersByTime(500);
    throttled(13);
    throttled(14);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(501);
    expect(fn).toHaveBeenLastCalledWith(14);
    throttled(15);
    throttled(16);
    expect(fn).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(1001);
    expect(fn).toHaveBeenLastCalledWith(16);
    jest.clearAllTimers();
  });

  test('leading: false, trailing: false', () => {
    const fn = jest.fn();
    // @ts-expect-error 测试异常，忽略此处错误
    expect(() => throttle(fn, 1000, { leading: false, trailing: false })).toThrowError();
  });
});

describe('once', () => {
  test('lastResult: false', () => {
    const fn = jest.fn().mockReturnValue(2);
    const onceFn = once(fn, { lastResult: false });

    let f = onceFn(12);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(12);
    expect(f).toBe(2);
    f = onceFn(13);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(f).toBeUndefined();
    jest.clearAllTimers();
  });

  test('lastResult: true', () => {
    const fn = jest.fn().mockReturnValue(2);
    const onceFn = once(fn);

    let f = onceFn(12);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(12);
    expect(f).toBe(2);
    f = onceFn(13);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(f).toBe(2);
    jest.clearAllTimers();
  });
});

describe('retry', () => {
  test('exceeded times', async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const fn = jest.fn(async () => {
      throw Error('exceeded');
    });
    await expect(retry(fn)).rejects.toThrowError('exceeded');
    expect(fn).toHaveBeenCalledTimes(3);
    jest.clearAllTimers();
  });

  test('success', async () => {
    let times = 1;
    // eslint-disable-next-line @typescript-eslint/require-await
    const fn = jest.fn(async () => {
      if (times < 2) {
        times++;
        throw Error(String(times));
      }
      return times;
    });
    const result = await retry(fn)();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toBe(2);
    jest.clearAllTimers();
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
