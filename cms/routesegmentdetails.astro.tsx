import { defineCollection, z } from 'astro:content'

export const astroRoutesegmentdetailsDefinition = defineCollection({
  type: 'content',
  schema: () =>
    z.object({
      title: z.string(),
      route: z.string(),
      latLng: z.string().optional(),
      position: z.number(),
      markerName: z.string(),
    }),
})
