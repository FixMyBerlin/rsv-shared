import { z } from 'astro/zod'

const statusOptions = ['In Planung'] as const

const position = z.tuple([z.number(), z.number()])
const geometryLinestring = z.strictObject({
  type: z.literal('LineString'),
  coordinates: z.array(position),
})
const properties = z.strictObject({
  subsectionSlug: z.string(),
  projectSlug: z.string(),
  operator: z.string(),
  estimatedCompletionDateString: z.string().nullish(),
  status: z.enum(statusOptions).nullish(),
})
export const ApiRouteGeometryFeatureSchema = z.strictObject({
  type: z.literal('Feature'),
  properties: properties,
  geometry: geometryLinestring,
})
export type ApiRouteGeometryFeature = z.infer<typeof ApiRouteGeometryFeatureSchema>

export const RouteGeometryFeatureSchema = ApiRouteGeometryFeatureSchema.merge(
  z.object({ id: z.string() }),
)
export type RouteGeometryFeature = z.infer<typeof RouteGeometryFeatureSchema>

export const ApiRouteGeometrySchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(ApiRouteGeometryFeatureSchema),
})

export type ApiRouteGeometryType = z.infer<typeof ApiRouteGeometrySchema>
