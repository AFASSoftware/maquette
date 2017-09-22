import pkg from './package.json';

// Typescript creates the commonJS package, let rollup do the rest

export default [
  // browser-friendly UMD build
  {
    input: 'dist/maquette.js',
    output: {
      file: pkg.browser,
      format: 'umd'
    },
    moduleName: 'maquette',
    plugins: []
  },
  // CommonJS build for nodeJS
  {
    input: 'dist/maquette.js',
    output: {
      file: pkg.main,
      format: 'cjs'
    }
  }
];
