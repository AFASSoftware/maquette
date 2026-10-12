import { dts } from 'rollup-plugin-dts';

// Typescript compiles src to dist, let rollup bundle that into single files

export default [
  // browser-friendly UMD build
  {
    input: 'dist/index.js',
    output: {
      name: 'maquette',
      file: 'dist/maquette.umd.js',
      format: 'umd'
    },
    plugins: []
  },
  // ES module build, used by the "import" condition
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/maquette.mjs',
      format: 'es',
      sourcemap: true
    }
  },
  // CommonJS build for nodeJS
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/maquette.cjs',
      format: 'cjs'
    }
  },
  // single-file type declarations for the "import" and "require" conditions
  {
    input: 'dist/index.d.ts',
    output: [
      { file: 'dist/maquette.d.mts', format: 'es' },
      { file: 'dist/maquette.d.cts', format: 'es' }
    ],
    plugins: [dts()]
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
