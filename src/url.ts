import { isObject } from './type';
import { numberReg } from './reg';
import { setDeepValue } from './object';

type ParamObject = {
  [K: string]: unknown;
};

/**
 * 拼接参数
 * @param url
 * @param params
 * @returns
 */
export function appendParam(url: string, params: string | ParamObject): string {
  const urlObject = new URL(url);
  if (typeof params === 'string') {
    const searchParam = new URLSearchParams(params);
    searchParam.forEach((v, k) => {
      urlObject.searchParams.append(k, v);
    });
  } else {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined) {
        return;
      }
      urlObject.searchParams.append(k, <string>v ?? '');
    });
  }
  return urlObject.toString();
}

/**
 * 获取url中的参数
 * @param url
 * @param param1
 * @returns
 */
export function getParam(url: string, { changeType = false } = {}): ParamObject {
  const urlObj = new URL(url);
  const param = Object.fromEntries(urlObj.searchParams.entries());
  changeType && changeParamValueType(param);
  return param;
}

/**
 * url 中的 search 字符串转参数对象
 * @param search
 * @param param1
 * @returns
 */
export function search2Param(search: string, { changeType = false } = {}): ParamObject {
  const sp = new URLSearchParams(search);
  const param = Object.fromEntries(sp.entries());
  changeType && changeParamValueType(param);
  return param;
}

/**
 * 参数对象转 search 字符串
 * @param param
 * @returns
 */
export function param2Search(param: ParamObject): string {
  const sp = new URLSearchParams();
  Object.entries(param).forEach(([k, v]) => {
    if (v === undefined) {
      return;
    }
    sp.append(k, <string>v ?? '');
  });

  return sp.toString();
}

/**
 * 把有深层嵌套的参数转换成一层的
 * @param param
 * @param option.mode - 对象处理方式， json: 对象转 json 字符串, form: 对象按表单对象处理 default is form
 * @returns
 */
export function normalizeParam(param: ParamObject, { mode = 'form' }: { mode?: 'json' | 'form' } = {}): ParamObject {
  const result: ParamObject = {};
  const entries = Object.entries(param);

  while (entries.length) {
    const [k, v] = entries.pop() as [string, unknown];
    if (isObject(v)) {
      if (mode === 'json') {
        result[k] = JSON.stringify(v);
      } else {
        // 兼容数组和对象的情况
        const ventries = Object.entries(v as ParamObject).map(([ck, cv]) => [`${k}[${ck}]`, cv] as [string, unknown]);
        entries.push(...ventries);
      }
      // eslint-disable-next-line no-continue
      continue;
    }
    result[k] = v;
  }
  return result;
}

/**
 * 参数值字符串尝试转数字，布尔，null, undefined
 * @param param
 */
export function changeParamValueType(param: ParamObject) {
  Object.keys(param).forEach(k => {
    // eslint-disable-next-line no-param-reassign
    param[k] = tryChangeType(param[k] as string);
  });
}

/**
 * 尝试将字符串格式的 布尔，数字，null, undefine 转成对应类型的值
 * @param input
 * @returns
 */
export function tryChangeType(input: string) {
  if (input === 'true') {
    return true;
  }
  if (input === 'false') {
    return false;
  }
  if (input === 'null') {
    return null;
  }
  if (input === 'undefined') {
    return undefined;
  }
  if (numberReg.test(input)) {
    return +input;
  }
  return input;
}

/**
 * 将 search 字符串转有层次结构的对象
 * @param search
 * @param option.changeType 是否尝试将参数值回去找成数字及布尔等类型
 * @param option.merge 是否将同名参数合并成数组
 * @returns
 */
export function restoreParam(search: string, { changeType = false, merge = false } = {}) {
  const param: AnyObject = {};
  const urlEntries = [...new URLSearchParams(search).entries()];
  if (merge) {
    let keys: { [name: string]: number } = {};
    urlEntries.forEach(([k]) => {
      keys[k] = (keys[k] || 0) + 1;
    });
    keys = Object.fromEntries(Object.entries(keys).flatMap(([k, v]) => (v > 1 ? [[k, 0]] : [])));

    urlEntries.forEach(entry => {
      const [k] = entry;
      if (Object.hasOwn(keys, k)) {
        // eslint-disable-next-line no-param-reassign
        entry[0] = `${entry[0]}[${keys[k]}]`;
        keys[k]++;
      }
    });
  }

  urlEntries.forEach(entry => {
    const [k, v] = entry;
    setDeepValue(param, k, changeType ? tryChangeType(v) : v);
  });
  return param;
}
