// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// https://astro.build/config
export default defineConfig({
  site: 'https://generative-lines.barthy.koeln',
  integrations: [starlight({
    title: '',
    logo: {
      src: './public/images/gen-lines_logo.svg',
    },
    sidebar: [
      {
        label: 'Documentation',
        // Autogenerate a group of links for the 'constellations' directory.
        autogenerate: { directory: 'docs' },
      },
      { label: 'Playground', link: '/' },
      { label: 'Demo', link: '/demo' },
    ],
    customCss: [
      './src/root.scss',
      './src/docs.scss',
    ]
  })]
})