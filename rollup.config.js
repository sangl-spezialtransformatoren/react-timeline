import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import packageJson from './package.json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import * as fs from 'fs';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/workers/createIntervals.ts',
    output: {
      dir: 'workers',
      format: 'cjs',
    },
    plugins: [
      typescript({ tsconfig: 'workers.tsconfig.json' }),
      resolve({ browser: true }),
      commonjs(),
      terser(),
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ useTsconfigDeclarationDir: true }),
      postcss(),
      replace({
        preventAssignment: true,
        'workerPath': () => {
          let workerCode = fs.readFileSync('workers/createIntervals.js', { encoding: 'base64' });
          return '"data:application/javascript;base64,' + workerCode + '"';
        },
      }),
    ],
  }];