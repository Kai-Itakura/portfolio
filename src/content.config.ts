import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const works = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      order: z.number(),
      tools: z.array(z.string()),
      time: z.string(),
      url: z.string().url(),
      lang: z.boolean().default(false),
      topImage: image(),
      heroImage: image(),
      mockUpImage: image(),
      image1: image(),
      image2: image()
    })
})

export const collections = { works }
