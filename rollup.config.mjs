import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { defineConfig } from 'rollup';

const srcDir = path.resolve(process.cwd(), 'src');
const files = fs.readdirSync(srcDir);
const sourceFiles = files.filter(f => f !== 'index.ts');

fs.writeFileSync(
  path.resolve(srcDir, 'index.ts'),
  sourceFiles.map(s => `export * from './${s.replace(/\.ts$/, '')}';`).join(os.EOL),
  'utf8',
);

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        dir: './es',
        format: 'es',
        entryFileNames: '[name].mjs',
        preserveModules: true,
      },
      {
        dir: './lib',
        format: 'cjs',
        preserveModules: true,
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
]);
