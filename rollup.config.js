import pkg from './package.json';

// Typescript creates the commonJS package, let rollup do the rest

export default [
  // browser-friendly UMD build
  {
    input: 'dist/index.js',
    output: {
      file: pkg.browser,
      format: 'umd'
    },
    moduleName: 'maquette',
    plugins: []
  },
  // CommonJS build for nodeJS
  {
    input: 'dist/index.js',
    output: {
      file: pkg.main,
      format: 'cjs'
    }
  },
  // bundles for examples
  {
    input: 'build/js/examples/benchmarks/uibench/app.js',
    output: {
      file: 'build/rollup/benchmarks-uibench.umd.js',
      format: 'umd'
    }
  },
  {
    input: 'build/js/examples/helloworld/helloworld.js',
    output: {
      file: 'build/rollup/helloworld.umd.js',
      format: 'umd'
    }
  }
];
