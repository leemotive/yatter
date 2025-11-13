import { describe, expect, test } from 'vitest';
import { broadcastIp, ipFromInt, ipToInt, isAllSameNet, parseNet } from '../src/net';

describe('ipTransform', () => {
  test.each([['192.168.6.246']])('ipTransform-%#', input => {
    expect(ipFromInt(ipToInt(input))).toBe(input);
  });
});

describe('parseNet', () => {
  test('192.168.1.0', () => {
    expect(parseNet('192.168.1.2', '255.255.255.0')).toEqual({
      ip: '192.168.1.2',
      ipInt: 3232235778,
      mask: '255.255.255.0',
      maskInt: 4294967040,
      netIp: '192.168.1.0',
      netIpInt: 3232235776,
      broadcastIp: '192.168.1.255',
      broadcastIpInt: 3232236031,
      ipStart: '192.168.1.1',
      ipStartInt: 3232235777,
      ipEnd: '192.168.1.254',
      ipEndInt: 3232236030,
      hostCount: 254,
    });
  });
});

describe('isAllSameNet', () => {
  test.each([['192.168.1.0', '192.168.1.1', '192.168.1.2', '192.168.1.254', '192.168.1.255']])(
    'isAllSameNet-%#',
    (...input) => {
      expect(isAllSameNet('255.255.255.0', ...input)).toBe(true);
    },
  );

  test.each([['192.168.0.0', '192.168.0.1', '192.168.1.2', '192.168.1.254', '192.168.1.255']])(
    'isAllSameNet-%#',
    (...input) => {
      expect(isAllSameNet('255.255.254.0', ...input)).toBe(true);
    },
  );

  test.each([['192.168.0.0', '192.168.0.1', '192.168.1.2', '192.168.1.254', '192.168.1.255']])(
    'isAllSameNet-%#',
    (...input) => {
      expect(isAllSameNet('255.255.255.0', ...input)).toBe(false);
    },
  );
});
