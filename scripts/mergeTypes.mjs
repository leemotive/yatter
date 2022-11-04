import fsp from 'fs/promises';
import path from 'path';
import os from 'os';

const cwd = process.cwd();

const gdts = fsp.readFile(path.resolve(cwd, 'types/index.d.ts'), 'utf8');
const dts = fsp.readFile(path.resolve(cwd, 'typings/index.d.ts'), 'utf8');

const types = await Promise.all([gdts, dts]);

fsp.writeFile(path.resolve(cwd, 'typings/index.d.ts'), types.join(os.EOL), 'utf8');
