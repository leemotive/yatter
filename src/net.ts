/* eslint-disable no-bitwise */

/**
 * ip地址转成一个正整数
 * @param ip
 * @returns
 */
export function ipToInt(ip: string) {
  return ip.split('.').reduce((num, part) => (num << 8) + +part, 0) >>> 0;
}

/**
 * 从一个正整数转成ip地址
 * @param num
 * @returns
 */
export function ipFromInt(num: number) {
  const parts = [];
  while (parts.length < 4) {
    parts.unshift(num & 0xff);
    // eslint-disable-next-line no-param-reassign
    num >>>= 8;
  }
  return parts.join('.');
}

/**
 * 获取网络地址
 * @param ip
 * @param mask
 * @returns
 */
export function netIp(ip: string, mask: string) {
  return (ipToInt(ip) & ipToInt(mask)) >>> 0;
}

/**
 * 获取广播地址
 * @param ip
 * @param mask
 * @returns
 */
export function broadcastIp(ip: string, mask: string) {
  return (ipToInt(ip) | ~ipToInt(mask)) >>> 0;
}

/**
 * 去掉ip每一部分意外引入的前置0
 * @param ip
 * @returns
 */
export function normalizeIp(ip: string) {
  return ip.split('.').map(Number).join('.');
}

/**
 * 判断是否为一个合法的ip地址
 * @param ip
 * @returns
 */
export function isValidIpv4(ip: string) {
  const parts = ip.split('.');
  if (parts.length !== 4) {
    return false;
  }
  return parts.every(part => {
    if (!/^\d+$/.test(part)) {
      return false;
    }
    if (/^0\d/.test(part)) {
      return false;
    }
    return Number(part) <= 255;
  });
}

/**
 * 判断ip是否在指定区间内
 * @param ip
 * @param startIp
 * @param endIp
 * @returns
 */
export function isIpBetween(ip: string, startIp: string, endIp: string) {
  const ipInt = ipToInt(ip);
  const startInt = ipToInt(startIp);
  const endInt = ipToInt(endIp);
  return ipInt >= startInt && ipInt <= endInt;
}

/**
 * 如何判断ip是不是指定的网络的主机地址
 * @param ip
 * @param cidr
 * @returns
 */
export function isCidrHost(ip: string, cidr: string) {
  const [netAddress, netLen] = cidr.split('/');

  const maskInt = parseInt('1'.repeat(+netLen).padEnd(24, '0'), 2);
  const netInt = ipToInt(netAddress);

  const startInt = (netInt & maskInt) >>> 0;
  const endInt = (netInt | ~maskInt) >>> 0;
  const ipInt = ipToInt(ip);

  return ipInt > startInt && ipInt < endInt;
}
