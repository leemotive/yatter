// eslint-disable-next-line import/no-extraneous-dependencies
import typescript from '@rollup/plugin-typescript';
// eslint-disable-next-line import/no-extraneous-dependencies
import dts from 'rollup-plugin-dts';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const srcDir = path.resolve(process.cwd(), 'src');
const files = fs.readdirSync(srcDir);
const sourceFiles = files.filter(f => f !== 'index.ts');

fs.writeFileSync(
  path.resolve(srcDir, 'index.ts'),
  sourceFiles.map(s => `export * from './${s.replace(/\.ts$/, '')}';`).join(os.EOL),
  'utf8',
);

const inputs = sourceFiles.concat('index.ts').map(f => path.resolve('./src', f));

export default [
  {
    input: inputs,
    output: [
      {
        dir: './es',
        format: 'es',
        entryFileNames: '[name].mjs',
      },
      {
        dir: './lib',
        format: 'cjs',
      },
    ],
    plugins: [typescript({ exclude: ['test'] })],
  },
  {
    input: './src/index.ts',
    output: [
      {
        file: './dist/yatter.js',
        format: 'umd',
        exports: 'named',
        name: 'yatter',
      },
    ],
    plugins: [typescript({ exclude: ['test'], compilerOptions: { target: 'es6' } })],
  },
  {
    input: './src/index.ts',
    output: {
      file: './typings/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
