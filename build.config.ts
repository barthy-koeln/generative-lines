import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/lib/config',
    'src/lib/renderer',
    'src/lib/lines-canvas',
  ],
  declaration: true,
  rollup: {
    inlineDependencies: false,
    esbuild: {
      target: 'esnext',
    },
  },
  hooks: {
    'build:done': () => {
      console.log('Build completed successfully')
    }
  }
})