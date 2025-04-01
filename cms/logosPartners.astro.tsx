import { defineCollection, z } from 'astro:content'

export const astroLogosPartnersDefinition = defineCollection({
  type: 'data',
  schema: ({ image }) =>
    z.object({
      position: z.number(),
      showInMenu: z.boolean().optional(),
      imageAlt: z.string(),
      image: image(),
      imageHeight: z.number().optional(),
      href: z.string().url().optional(),
    }),
})
