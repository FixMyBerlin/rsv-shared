import { collection, fields } from '@keystatic/core'
import { mdxComponentsKeystatic } from './components/mdxComponentsKeystatic'
export const keystaticRoutesegmentsConfig = collection({
  label: 'Abschnitte',
  path: 'src/content/routesegments/*',
  slugField: 'title',
  columns: ['position'],
  format: { contentField: 'body' },
  schema: {
    title: fields.slug({ name: { label: 'Titel' } }),
    // tsSlug: fields.select({
    //   label: 'Trassenscout Slug',
    //   description:
    //     'Slug des Planungsabschnittes im Trassenscout (`subsectionSlug`), damit die Geometry zugeordnet werden kann.',
    //   options: cachedRouteGeometry.features.map((feature) => {
    //     return {
    //       label: `${feature.id} — ${feature.properties.status || '(?)'} — ${feature.properties.operator || '(?)'}`,
    //       value: feature.id,
    //     }
    //   }),
    //   defaultValue: cachedRouteGeometry.features.map((feature) => feature.id).at(0)!,
    // }),
    tsSlug: fields.relationship({
      label: 'Trassenscout Slug',
      description:
        'Slug des Planungsabschnittes im Trassenscout (`subsectionSlug`), damit die Geometry zugeordnet werden kann. Diese Liste enthält alle Planungsabschnitte die zum Zeitpunkt als die Zeite generiert wurde, über die API abgerufen werden konnten.',
      collection: 'routegeometries',
    }),
    operator: fields.text({ label: 'Baulastträger' }),
    contact: fields.text({ label: 'Ansprechpartner*in' }),
    position: fields.number({ label: 'Position' }),
    markerPositionBottom: fields.checkbox({
      label: 'Tip-Marker in der Karte unten anzeigen',
      defaultValue: false,
      description:
        'Standardmäßig erscheint der Tip-Marker in der Karte oberhalb der Linie. Hier einen Haken setzen, wenn der Tip-Marker unten erscheinen soll.',
    }),
    documents: fields.array(
      fields.object({
        document: fields.file({
          label: 'Dokument',
          validation: { isRequired: true },
          directory: 'public/files/',
          publicPath: '/files/',
        }),
        description: fields.text({ label: 'Beschreibung' }),
        title: fields.text({ label: 'Titel', validation: { isRequired: true } }),
      }),

      {
        itemLabel: (props) => props.fields.title.value,
        label: 'Dokumente',
      },
    ),
    socials: fields.array(
      fields.object({
        type: fields.select({
          label: 'Typ',
          options: [
            { value: 'facebook', label: 'Facebook' },
            { value: 'instagram', label: 'Instagram' },
            { value: 'linkedin', label: 'LinkedIn' },
            { value: 'tiktok', label: 'TikTok' },
          ],
          defaultValue: 'facebook',
        }),
        label: fields.text({ label: 'Label', validation: { isRequired: true } }),
        link: fields.url({ label: 'Link', validation: { isRequired: true } }),
      }),
      {
        itemLabel: (props) => props.fields.label.value,
        label: 'Social Media Links',
      },
    ),
    body: fields.mdx({
      label: 'Text',
      components: mdxComponentsKeystatic('routesegments'),
      options: { image: false },
    }),
  },
})
