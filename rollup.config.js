import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import uglify from 'rollup-plugin-uglify';

export default {
  input: 'src/index.ts',
  plugins: [
    resolve(),
    commonjs({
      namedExports: {
        'src/lang.gen.js': [ 'parse' ]
      }
    }),
    typescript({
      typescript: require('typescript')
    }),
    uglify({
      compress: {
        drop_console: true
      }
    }),
    filesize()
  ],
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'like-a-glove'
  }
};