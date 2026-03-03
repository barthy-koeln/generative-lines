import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/lib/index'
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