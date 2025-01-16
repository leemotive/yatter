type DebounceOption<T> = {
  trailing?: T;
  leading?: T extends false | undefined ? true : boolean;
};
/**
 * 防抖
 * @param fun
 * @param delay - 间隔时间
 * @param option
 * @param option.leading - 是否立即执行第一次 default is true
 * @param option.trailing - 是否保证最后一次执行 default is false
 * @returns
 */
export function debounce<F extends AnyFunction, T extends boolean | undefined = false>(
  fun: F,
  delay: number,
  option: DebounceOption<T> = {},
) {
  const { leading = true, trailing = false } = option;
  if (!leading && !trailing) {
    throw Error('leading and trailing is all false, the callback will never be called. assign at least one width true');
  }
  let timer = 0;
  function timeout<C>(context: C, ...args: Parameters<F>) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = 0;
      trailing && fun.call(context, ...args);
    }, delay);
  }

  return function proxyFunc<C>(this: C, ...args: Parameters<F>): void {
    if (!timer && leading) {
      fun.call(this, ...args);

      timer = setTimeout(() => {
        timer = 0;
      }, delay);
      return;
    }
    timeout(this, ...args);
  };
}

type ThrottleOption<T> = {
  trailing?: T;
  leading?: T extends false ? true : boolean;
};
/**
 * 节流
 * @param fun
 * @param delay
 * @param option
 * @param option.leading - 是否立即执行首次 default is true
 * @param option.trailing - 是否保证执行最后一次 default is true
 * @returns
 */
export function throttle<F extends AnyFunction, T extends boolean | undefined = true>(
  fun: F,
  delay: number,
  option: ThrottleOption<T> = {},
) {
  const { leading = true, trailing = true } = option;
  if (!leading && !trailing) {
    throw Error('leading and trailing is all false, the callback will never be called. assign at least one width true');
  }
  let latestArgs: unknown[] | undefined;
  let timer = 0;
  function timeout<C>(context: C, args?: Parameters<F>) {
    if (trailing) {
      latestArgs = args;
    }
    if (timer) {
      return;
    }
    timer = setTimeout(function callback() {
      timer = 0;
      if (latestArgs) {
        fun.call(context, ...latestArgs);
        timeout(context);
      }
    }, delay);
  }

  return function proxyFunc<C>(this: C, ...args: Parameters<F>): void {
    if (!timer && leading) {
      fun.call(this, ...args);
      timeout(this);
      return;
    }
    timeout(this, args);
  };
}

/**
 * 返回自身的函数
 * @param ele
 * @returns
 */
export function self<T>(ele: T): T {
  return ele;
}

/**
 * 只能调用一次的函数，
 * @param fun
 * @param option - 重复调用是否返回第一次调用的结果
 * @param option.lastResult - 重复调用是否返回第一次调用的结果 default is true
 * @returns
 */
export function once<F extends AnyFunction, T extends boolean | undefined = true>(
  fun: F,
  option: { lastResult?: T } = {},
) {
  const { lastResult = true } = option;

  type FunctionReturn = ReturnType<F> | (T extends false ? undefined : never);

  let called = false;
  let result: FunctionReturn;
  return function proxyFunc<C>(this: C, ...args: Parameters<F>): FunctionReturn {
    if (called) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return lastResult ? result : (undefined as FunctionReturn);
    }
    called = true;
    result = fun.call(this, ...args) as FunctionReturn;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  };
}

/**
 * 函数抛出异常后，自动重试函数
 * @param fun 需要是异步函数，同步函数一般情况下也没必要重试
 * @param option.max - 每一次调用，函数最多执行次数(首次调用计算在内) default is 3, 相当于除首次调用执行，还可以在错误后额外再执行2次
 * @returns
 */
export function retry<F extends AnyFunction>(fun: F, { max = 3 } = {}) {
  type FReturn = Awaited<ReturnType<F>>;
  return async function proxyFunc<T>(this: T, ...args: Parameters<F>): Promise<FReturn> {
    let err: unknown;
    let times = 0;
    while (times < max) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await fun.call(this, ...args);
        return result as FReturn;
      } catch (e: unknown) {
        err = e;
        times++;
      }
    }

    throw err;
  };
}

type PollOption<F extends AnyFunction> = {
  delay?: number;
  next?: (res: Awaited<ReturnType<F>>) => boolean | Promise<boolean>;
  breakOnException?: boolean;
};
/**
 * 轮询，自动重复执行函数
 * @param fun
 * @param option
 * @param option.delay - 轮询间隔毫秒数 default is 1000
 * @param option.next - 是否进入下一次轮询的判断开关，每次将要进行下一次轮询前将通过此方法进行判断是否要继续，默认始终继续
 * @param option.breakOnException - 是否在发生异常时中断轮询
 * @returns 轮询启动函数，启动函数的返回结果是轮询中断函数
 */
export function poll<F extends AnyFunction>(
  fun: F,
  { delay = 1000, next = () => true, breakOnException = false } = {} as PollOption<F>,
) {
  let timer = 0;
  return function start<T>(this: T, ...args: Parameters<F>) {
    void proxyFunc.call(this, ...args);
    return function stop() {
      clearTimeout(timer);
    };
  };

  async function proxyFunc<T>(this: T, ...args: Parameters<F>) {
    try {
      const result = await fun.call(this, ...args);
      const callNext = await next(result);
      if (!callNext) {
        return;
      }
    } catch {
      if (breakOnException) {
        return;
      }
    }
    timer = setTimeout(() => {
      void proxyFunc.call(this, ...args);
    }, delay);
  }
}

/**
 * 创建一个排队执行函数，上一个函数的结果将传递给下一个函数作为参数
 * @param funs
 * @returns 调用返回的函数，启动函数队列执行，并将参数传递给第一个函数
 */
export function queue(...funs: AnyFunction[]) {
  return async function start(init?: unknown) {
    return funs.reduce(async (q, fun) => fun(await q), Promise.resolve(init));
  };
}

/**
 * 创建函数并发执行管理器
 * @param option
 * @param option.max - 最大并发数 default is 3
 * @returns 调用返回的函数向执行管理器添加待执行函数
 */
export function concurrent({ max = 3 } = {}) {
  const list: AnyFunction[] = [];
  let finished = false;
  let resolve: AnyFunction;
  let wait = newWait();
  let waiting = 0;
  const results: Array<{ status: 'fulfilled'; value: unknown } | { status: 'rejected'; reason: unknown }> = [];

  async function callNext() {
    if (!list.length) {
      if (!waiting) {
        resolve();
      }
      return;
    }
    const index = results.length;
    try {
      waiting++;
      const value = await list.shift()?.();
      results[index] = { status: 'fulfilled', value };
    } catch (e) {
      results[index] = { status: 'rejected', reason: e };
    } finally {
      waiting--;
      void callNext();
    }
  }

  function newWait() {
    results.length = 0;

    return new Promise(r => {
      resolve = () => {
        finished = true;
        r(results);
      };
    });
  }

  return function add(...func: AnyFunction[]) {
    if (finished) {
      finished = false;
      wait = newWait();
    }
    list.push(...func);

    while (waiting < max) {
      void callNext();
    }

    return wait;
  };
}

/**
 * 生成一个添加器，通过添加器添加的函数之前相互限制，一旦其中一个函数被调用过，其它函数也将不会再被调用。
 * @returns 函数添加器
 */
export function createRace() {
  let called = false;
  return <T extends AnyFunction>(fn: T) =>
    function proxyFun(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
      if (called) {
        return undefined;
      }
      called = true;
      return fn.call(this, ...args);
    };
}
