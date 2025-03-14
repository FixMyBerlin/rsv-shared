import { collection, fields } from '@keystatic/core'
import type { FeatureCollection } from 'geojson'
import cachedRouteGeometry from 'src/content_cache/routegeometry.json'
import { MapPoint } from './components/keystaticComponents/MapPoint/MapPoint'
import { mdxComponentsKeystatic } from './components/mdxComponentsKeystatic'

export const keystaticRoutesegmentdetailsConfig = collection({
  label: 'Detailinfos zu Abschnitten',
  path: 'src/content/routesegmentdetails/*',
  slugField: 'title',
  format: { contentField: 'body' },
  columns: ['title', 'route', 'markerName', 'position'],
  schema: {
    title: fields.slug({ name: { label: 'Titel' } }),
    route: fields.relationship({
      label: 'Abschnitt',
      collection: 'routesegments',
      description: 'Der Abschnitt (Planungsabschnitt), zu dem dieses Detail gehört.',
    }),
    latLng: MapPoint({
      label: 'Tip-Marker Position',
      referenceGeometry: cachedRouteGeometry as FeatureCollection,
      validation: { isRequired: false },
    }),
    markerName: fields.text({
      label: 'Tip-Marker Name',
      description: 'Zum Beispiel 1.12',
      validation: { isRequired: true },
    }),
    position: fields.number({
      label: 'Reihenfolge der Beiträge',
      description:
        'Tipp: 10er-Sprünge verwenden um später Beiträge dazwischen einsortieren zu können.',
      validation: { isRequired: true },
    }),
    body: fields.mdx({
      label: 'Text',
      components: mdxComponentsKeystatic('routesegments'),
      options: { image: false },
    }),
  },
})
