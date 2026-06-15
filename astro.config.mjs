import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://portfolio.itakai199969-e42.workers.dev',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
})
