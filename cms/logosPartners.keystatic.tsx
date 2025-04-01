import { collection, fields } from '@keystatic/core'

export const keystaticLogosPartnersConfig = collection({
  label: 'Partner Logos',
  path: 'src/content/logosPartners/*',
  slugField: 'imageAlt',
  columns: ['position'],
  schema: {
    showInMenu: fields.checkbox({
      label: 'In der Menü-Leiste anzeigen',
      description:
        'Wenn aktiviert, wird Logo in Menü-Leiste angezeigt, sonst im Footer unter "In Zusammenarbeit mit".',
      defaultValue: true,
    }),
    position: fields.number({ label: 'Reihenfolge', validation: { isRequired: true } }),
    imageAlt: fields.slug({ name: { label: 'Bild Alt Attribut' } }),
    image: fields.image({
      label: 'Bild',
      description: 'Bild bitte im Format 80x80px hochladen. (Pixel, kein SVG!)',
      directory: 'src/content/logosPartners',
      publicPath: '../../content/logosPartners',
      validation: { isRequired: true },
    }),
    imageHeight: fields.number({
      label: 'Sonderwert Höhe (px)',
      description:
        'Manche Bilder (bspw. querformatige Bilder) brauchen eine andere Höhe als 40px, hier kann dann ein geringerer Wert angegeben werden, bspw. 30px.',
    }),
    href: fields.url({ label: 'Link' }),
  },
})
