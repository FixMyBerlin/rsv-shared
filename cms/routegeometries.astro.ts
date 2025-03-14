import { BASE_CONFIG } from '@config/config'
import { featureCollection } from '@turf/turf'
import { defineCollection } from 'astro:content'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { basePath } from './routegeometries.keystatic'
import {
  ApiRouteGeometrySchema,
  RouteGeometryFeatureSchema,
  type RouteGeometryFeature,
} from './routegeometries.schema'
import { loader } from './utils/loader'

export const astroRouteGeometriesDefinition = defineCollection({
  // We need to wrap extract this into a function to make Astro TS happy.
  loader: await customLoader(),
  schema: () => RouteGeometryFeatureSchema,
})

// GENERAL: We fetch fresh data from the API and store it in a JSON file.
// But then we use Astro file loader to load that file just as we would any static content.
// The difference being, that we refresh this file automatically on each build.
async function customLoader() {
  // 1. Refresh cache
  await fetchAndStore()

  // 2. Load cached files
  return loader(basePath, 'json')
}

async function fetchAndStore() {
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
      throw new Error(`Fetching data from TS failed; check the API ${apiUrl}`)
    }
    const json = await raw.json()
    const parsed = ApiRouteGeometrySchema.safeParse(json)
    if (parsed.success) {
      parsed.data.features.forEach((feature) => {
        const featureWithId = {
          id: feature.properties.subsectionSlug,
          ...feature,
        }
        features.push(featureWithId)
      })
    } else {
      console.error('Fetching data from TS failed during ZOD parsing', apiUrl, parsed.error)
    }
  }

  if (features.length === 0) {
    console.error('Fetching data from TS; no geometries found')
    throw new Error(
      `Fetching data from TS; no geometries found ${JSON.stringify(BASE_CONFIG.TRASSENSCOUT_PROJECT_API_URL)}`,
    )
  }

  // Store one json per TS subsectionSlug to be used by keystatic and astro as content collection
  const cacheOutputPath = join(process.cwd(), 'src', 'content_cache', 'routeGeometry.json')
  await writeFile(cacheOutputPath, JSON.stringify(featureCollection(features), null, 2))

  // We also store a chached version as featureCollection, see src/content_cache/README.md
  const outputPath = join(process.cwd(), 'src', 'content', 'routegeometries')
  for (const feature of features) {
    await writeFile(join(outputPath, `${feature.id}.json`), JSON.stringify(feature, null, 2))
  }
}
