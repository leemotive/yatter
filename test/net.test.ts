import { ipFromInt, ipToInt } from '../src/net';

describe('ipTransform', () => {
  test.each([['192.168.6.246']])('ipTransform-%#', input => {
    expect(ipFromInt(ipToInt(input))).toBe(input);
  });
});
