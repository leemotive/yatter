import { isEmpty, isMatch, isMatchSome, Matcher, TestFunction } from './is';
import { isObject } from './type';

type SimpleMatcher<T = any> = string | string[] | RegExp | TestFunction<keyof T>;
type PropsMap = {
  from: SimpleMatcher;
  to: string | ((o: string) => string);
};
type Extension<R> = R & AnyObject;

/**
 * 按定义的规则从对象中获取指定属性及值
 * @param input
 * @param matchers
 * @returns
 */
export function pick<I extends AnyObject, R extends AnyObject = Extension<Partial<I>>>(
  input: I,
  matchers: Array<SimpleMatcher<I> | PropsMap>,
): R {
  type K = keyof I;
  const simpleMathcer: Array<SimpleMatcher> = matchers.map(m => {
    if (Array.isArray(m)) {
      return m[0];
    }
    return (m as PropsMap).from || <SimpleMatcher>m;
  });

  return (Object.keys(input) as K[]).reduce((res, key: K) => {
    const index: number = simpleMathcer.findIndex(m => isMatch<K, SimpleMatcher>(key, m));
    // eslint-disable-next-line no-bitwise
    if (~index) {
      const matcher = matchers[index] as PropsMap;
      let mappedKey: K = key;
      if (Array.isArray(matcher)) {
        // eslint-disable-next-line prefer-destructuring
        mappedKey = matcher[1];
      } else if (matcher.from) {
        mappedKey = (typeof matcher.to === 'function' ? matcher.to(key as string) : matcher.to) as K;
      }
      Object.assign(res, { [mappedKey]: input[key] });
    }
    return res;
  }, {} as R);
}

/**
 * 按定义从对象中去除指定属性，返回剩余的属性及值
 * @param input
 * @param matchers
 * @returns
 */
export function cut<I extends AnyObject, T, K = keyof I>(input: I, matchers: Matcher<K, T>[]): Partial<I> {
  const entries = Object.entries(input).filter(([key]) => !isMatchSome<K, T>(key as K, matchers));
  return Object.fromEntries(entries) as Partial<I>;
}

type CloneMode = 'deep' | 'shallow' | 'json';
/**
 * 对象拷贝
 * @param origin
 * @param mode - 分为 deep: 深拷贝, shallow: 浅拷贝, json: 序列化拷贝 default is deep
 * @returns
 */
export function clone<C>(origin: C, mode: CloneMode = 'deep'): C {
  let fromObj = origin;
  type K = keyof C;
  if (!fromObj || !isObject(fromObj)) {
    return fromObj;
  }
  // @ts-expect-error 尝试读取 clone 方法
  if (typeof fromObj.clone === 'function') {
    // @ts-expect-error 尝试读取 clone 方法
    return fromObj.clone() as C;
  }

  if (mode === 'json') {
    return JSON.parse(JSON.stringify(fromObj)) as C;
  }

  if (mode === 'shallow') {
    return (Array.isArray(fromObj) ? fromObj.slice() : { ...fromObj }) as C;
  }

  // 深拷贝
  let toObj = emptyOf(fromObj) as C;
  const split = Symbol('split');
  const keyStack: unknown[] = [...Object.keys(fromObj).reverse(), toObj, fromObj, split];

  // 标记循环引用的
  const circle = new Map();
  circle.set(fromObj, toObj);
  while (keyStack.length) {
    const key = keyStack.pop() as K;
    if (key === split) {
      fromObj = keyStack.pop() as C;
      toObj = keyStack.pop() as C;
      // eslint-disable-next-line
      continue;
    }

    const fromValue = fromObj[key];
    toObj[key] = emptyOf(fromValue);
    if (!isObject(fromValue)) {
      toObj[key] = fromValue;
      // eslint-disable-next-line
      continue;
    }

    if (circle.has(fromValue)) {
      toObj[key] = circle.get(fromValue);
      // eslint-disable-next-line
      continue;
    }

    const toValue = toObj[key];
    // @ts-expect-error 可能存在 clone 方法
    if (typeof fromValue.clone === 'function') {
      // @ts-expect-error 可能存在 clone 方法
      toObj[key] = fromValue.clone();
    } else if (fromValue && isObject(fromValue)) {
      keyStack.push(toObj, fromObj, split, ...Object.keys(fromValue).reverse(), toValue, fromValue, split);
    }

    circle.set(fromValue, toObj[key]);
  }
  return toObj;
}

/**
 * 按照规则过滤出符合条件的属性及值
 * @param input
 * @param matcher
 * @param param2
 * @returns
 */
export function filter<T extends AnyObject>(
  input: T,
  matcher: (item: [string | number, unknown]) => boolean,
  { deep = false, empty = 'reserve' }: { deep?: boolean; empty?: 'reserve' | 'trim' } = {},
): Partial<T> {
  const obj = clone(input, 'deep');
  const split = Symbol('split');
  const arr = Array.isArray(obj) ? obj.filter((item, index) => isMatch([index, item], matcher)) : [obj];
  const result = Array.isArray(obj) ? arr : arr[0];

  while (arr.length) {
    const current = arr.pop();

    if (current === split) {
      const eles = arr.pop() as any[];
      const idx: number[] = eles.reduce((indexs, item, index) => (isEmpty(item) ? [index, ...indexs] : indexs), []);
      idx.forEach(index => eles.splice(index, 1));
      // eslint-disable-next-line
      continue;
    }

    Object.entries(current)
      .filter(entry => !isMatch(entry, matcher))
      .reverse()
      .forEach(([key]) => {
        if (Array.isArray(current)) {
          current.splice(+key, 1);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          delete current[key];
        }
      });

    if (!deep) {
      // eslint-disable-next-line
      continue;
    }

    if (Array.isArray(current) && empty === 'trim') {
      arr.push(current, split);
    }

    Object.entries(current).forEach(([, v]) => {
      isObject(v) && arr.push(v);
    });
  }
  return result;
}

type Parents<N> = N[];
type TraverseCallback<N> = (node: N, option: { parents: Parents<N> }) => boolean | void;
/**
 * 广度优先遍历
 * @param tree
 * @param callback
 * @param option
 * @param option.children - 定义子节点的属性名 default is children
 * @returns
 */
export function bfTraverse<N>(
  tree: OneOrMore<NotArray<N>>,
  callback: TraverseCallback<N>,
  { children = 'children' } = {},
) {
  const split = Symbol('split');
  type TraverseItem = N | Parents<N> | symbol;

  const arr = [tree].flat(1).filter(Boolean) as TraverseItem[];

  const next: TraverseItem[] = [];
  let parents: Parents<N> = [];

  while (arr.length) {
    const current = arr.pop();

    if (current === split) {
      parents = arr.pop() as Parents<N>;
      // eslint-disable-next-line no-continue
      continue;
    }

    const res = callback(current as N, { parents });
    if (res === false) {
      return;
    }

    const childs = (current as N)[children as keyof N] as NotArray<N>[];
    if (childs?.length) {
      next.push(...childs, [...parents, current as N], split);
    }
    if (!arr.length) {
      arr.push(...next);
      next.length = 0;
    }
  }
}

/**
 * 深度优先遍历
 * @param tree
 * @param callback
 * @param option
 * @param option.children - 定义子节点的属性名 default is children
 * @returns
 */
export function dfTraverse<N>(
  tree: OneOrMore<NotArray<N>>,
  callback: TraverseCallback<N>,
  { children = 'children' } = {},
) {
  const split = Symbol('split');
  type TraverseItem = N | Parents<N> | symbol;

  const arr = [tree].flat(1).filter(Boolean) as TraverseItem[];

  let parents: Parents<N> = [];

  while (arr.length) {
    const current = arr.pop();

    if (current === split) {
      parents = arr.pop() as Parents<N>;
      // eslint-disable-next-line no-continue
      continue;
    }

    const res = callback(current as N, { parents });
    if (res === false) {
      return;
    }

    const childs = (current as N)[children as keyof N] as NotArray<N>[];
    if (childs?.length) {
      arr.push(parents, split, ...childs, [...parents, current as N], split);
    }
  }
}

type TreeNode = {
  [k: string]: any;
};
type NodeKey = keyof TreeNode;
type TreeNodeMap = {
  [k: string | number]: TreeNode;
};
/**
 * 具有层次属性的数组，转化为树结构
 * @param nodes
 * @param option
 * @param option.id - 节点唯一标识属性 default is id
 * @param option.pid - 标记父节点的属性 default is pid
 * @param option.children - 标记子节点的属性 default is children
 * @returns
 */
export function makeTree(nodes: TreeNode[], option: { id?: NodeKey; pid?: NodeKey; children?: NodeKey } = {}) {
  const { id = 'id', pid = 'pid', children = 'children' } = option;

  const topNodes: TreeNode[] = [];
  const nodeMap: TreeNodeMap = {};

  nodes.forEach(function handler(node) {
    const key = node[id] as NodeKey;
    const pKey = node[pid] as NodeKey;

    if (nodeMap[key]) {
      Object.assign(nodeMap[key], node);
    } else {
      nodeMap[key] = node;
    }

    if (!pKey) {
      topNodes.push(nodeMap[key]);
      return;
    }

    let parent = nodeMap[pKey];
    if (parent) {
      let childList = parent[children] as TreeNode[];
      if (!childList) {
        childList = [];
        parent[children] = childList;
      }
      childList.push(node);
    } else {
      parent = { [id]: pKey, [pid]: undefined, [children]: [node] };
      nodeMap[pKey] = parent;
    }
  });
  return topNodes;
}

/**
 * 参数为数组则返回空数组，参数是对象则返回空对象，否则参数原样返回
 * @param t
 * @returns
 */
export function emptyOf<T>(t: T): T {
  if (Array.isArray(t)) {
    return [] as T;
  }
  if (isObject(t)) {
    return {} as T;
  }
  return t;
}

type Duplicate = 'overwrite' | 'concat';
/**
 * 返回键值互换的新对象
 * @param input
 * @param option
 * @param option.duplicate - 定义值重复后转为键时的冲突处理方式， 分为 overwrite: 覆盖， concat: 使用数组保存所有, default is concat
 * @returns
 */
export function invert(input: AnyObject, option: { duplicate?: Duplicate } = {}): AnyObject<OneOrMore<string>> {
  const { duplicate } = option;
  const entries = Object.entries(input).map(([k, v]) => [v, k]);
  if (duplicate === 'overwrite') {
    return Object.fromEntries(entries) as AnyObject<OneOrMore<string>>;
  }
  const result = (entries as Array<[string, string]>).reduce((acc, [k, v]) => {
    if (Object.hasOwn(acc, k)) {
      const o = acc[k];
      if (Array.isArray(o)) {
        o.push(v);
      } else {
        acc[k] = [o, v];
      }
    } else {
      acc[k] = v;
    }
    return acc;
  }, {} as AnyObject<OneOrMore<string>>);
  return result;
}

/**
 * 按 key 的层级结构深层取值
 * @param obj
 * @param key
 * @param option
 * @param option.create - 父级属性不存在时，是否创建父级属性 default is false
 * @returns
 */
export function getDeepValue<R = unknown>(obj: AnyObject, key: string, { create = false } = {}): R {
  let result = obj;
  const keys = key.split(/[[\].]+/).filter(Boolean);
  while (keys.length) {
    if (!isObject(result)) {
      throw Error('unexcept key');
    }
    const k = keys.shift() as string;
    if (result[k] == null) {
      if (create && keys.length) {
        result[k] = /\D/.test(keys[0]) ? {} : [];
      } else {
        result = undefined as any;
        break;
      }
    }
    result = result[k] as AnyObject;
  }
  return result as R;
}

/**
 * 按 key 层级结构设值
 * @param obj
 * @param key
 * @param value
 * @param option
 * @param option.create - 父级属性不存在时，是否创建父级属性 default is true
 * @returns
 */
export function setDeepValue(obj: AnyObject, key: string, value: unknown, { create = true } = {}): boolean {
  let result = obj;
  const keys = key.split(/[[\].]+/).filter(Boolean);
  const name = keys.pop() as string;
  while (keys.length) {
    if (!isObject(result)) {
      return false;
    }
    const k = keys.shift() as string;
    if (result[k] == null) {
      if (create) {
        result[k] = /\D/.test(keys[0] || name) ? {} : [];
      } else {
        return false;
      }
    }
    result = result[k] as AnyObject;
  }

  if (!isObject(result) && !name) {
    return false;
  }
  result[name] = value;
  return true;
}
