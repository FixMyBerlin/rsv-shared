import { collection, fields } from '@keystatic/core'

export const basePath = 'src/content/routegeometries'
export const keystaticRoutegeometries = collection({
  label: 'Routengeometry [READONLY]',
  path: `${basePath}/*`,
  slugField: 'id',
  format: { data: 'json' },
  schema: {
    id: fields.text({ label: '[READONLY] Trassenscout Subsection ID' }),
    type: fields.text({ label: '[READONLY] GeoJson Type' }),
    properties: fields.object(
      {
        status: fields.text({ label: '[READONLY] TS status' }),
        subsectionSlug: fields.text({ label: '[READONLY] TS subsectionSlug' }),
        projectSlug: fields.text({ label: '[READONLY] TS projectSlug' }),
        operator: fields.text({ label: '[READONLY] TS operator' }),
        estimatedCompletionDateString: fields.text({
          label: '[READONLY] TS estimatedCompletionDateString',
        }),
      },
      { label: '[READONLY] GeoJson Properties' },
    ),
    geometry: fields.object(
      {
        type: fields.text({ label: '[READONLY] Geometry Type' }),
        coordinates: fields.array(
          fields.array(fields.number({ label: '[READONLY] Coordinates Lat/Lng' })),
          { label: '[READONLY] GeoJson coordinates' },
        ),
      },
      { label: '[READONLY] GeoJson Geometry' },
    ),
  },
})
