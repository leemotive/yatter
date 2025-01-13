import { toCssVars } from '../src/css';

test('toCssVars', () => {
  const style = { menuWidth: '230px', bgColor: '#fff' };

  expect(toCssVars(style)).toEqual({
    '--menu-width': '230px',
    '--bg-color': '#fff',
  });
});
