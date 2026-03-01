import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/lib/lines-canvas',
    'src/lib/renderer',
  ],
  declaration: true,
  rollup: {
    inlineDependencies: true,
    esbuild: {
      target: 'es2020',
    },
  },
  hooks: {
    'build:done': () => {
      console.log('Build completed successfully')
    }
  }
})