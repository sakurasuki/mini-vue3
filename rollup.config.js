import typescript from '@rollup/plugin-typescript'
import pkg from './package.json' assert { type: 'json' }
export default {
  input: './src/index.ts', //入口文件
  output: [
    {
      format: 'cjs',
      file: pkg.main
    },
    {
      format: 'es',
      file: pkg.module
    }
  ], //出口
  plugins: [typescript({ resolveJsonModule: true })]
}
