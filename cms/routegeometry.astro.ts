import { BASE_CONFIG } from '@config/config'
import { featureCollection } from '@turf/turf'
import { defineCollection } from 'astro:content'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import {
  ApiRouteGeometrySchema,
  RouteGeometryFeatureSchema,
  type RouteGeometryFeature,
} from './routegeometry.schema'

export const astroRouteGeometryDefinition = defineCollection({
  loader: async () => {
    // We try fetching fresh data from TS but if that fails, we cancel the build.

    const features: RouteGeometryFeature[] = []
    for (const apiUrl of BASE_CONFIG.TRASSENSCOUT_PROJECT_API_URL) {
      const raw = await fetch(apiUrl)
      if (!raw.ok) {
        console.error(
          'Fetching data from TS failed; check the API',
          apiUrl,
          raw.status,
          raw.statusText,
        )
        // throw new Error(`Fetching data from TS failed; check the API ${apiUrl}`)
      }
      const json = await raw.json()
      const parsed = ApiRouteGeometrySchema.parse(json)
      parsed.features.forEach((feature) => {
        const featureWithId = {
          id: feature.properties.subsectionSlug,
          ...feature,
        }
        features.push(featureWithId)
      })
    }

    if (features.length === 0) {
      console.error('Fetching data from TS; no geometries found')
      // throw new Error(
      //   `Fetching data from TS; no geometries found ${JSON.stringify(BASE_CONFIG.TRASSENSCOUT_PROJECT_API_URL)}`,
      // )
    }

    // For our CMS we need a JSON version that we can load from the file system
    // We therefore write a version of the data into public/temp
    const outputPath = join(process.cwd(), 'public', 'TEMP', 'routegeometry.json')
    await writeFile(
      outputPath,
      JSON.stringify(featureCollection(features.sort((a, b) => a.id.localeCompare(b.id))), null, 2),
    )

    return features
  },

  schema: () => RouteGeometryFeatureSchema,
})
