import { parseLatLngString } from '@shared/cms/components/keystaticComponents/MapPoint/parseLatLngString'
import type { CollectionEntry, InferEntrySchema } from 'astro:content'
import { Marker } from 'react-map-gl/maplibre'
import { RouteMap } from './RouteMap'

type Props = {
  features: InferEntrySchema<'routegeometries'>[]
  routesegments: CollectionEntry<'routesegments'>[]
  segmentFocusSlug?: string
  routesegmentDetails: CollectionEntry<'routesegmentdetails'>[]
}

export const RoutesegmentMap = ({
  features,
  routesegments,
  segmentFocusSlug,
  routesegmentDetails,
}: Props) => {
  const routesegmentDetailMarkers = routesegmentDetails
    .map((detail) => {
      const point = parseLatLngString(detail.data.latLng)
      if (!point) return null
      return (
        <Marker
          key={detail.data.latLng}
          latitude={point.lat}
          longitude={point.lng}
          className="flex min-w-8 items-center justify-center rounded-lg border bg-white px-2 font-sans text-base font-extrabold shadow-lg"
        >
          {detail?.data.markerName}
        </Marker>
      )
    })
    .filter(Boolean)

  const focusSegemntId = routesegments.find((s) => s.slug === segmentFocusSlug)?.data.tsSlug

  return (
    <RouteMap
      features={features}
      routesegments={routesegments}
      focusSegemntId={focusSegemntId}
      routesegmentDetailMarkers={routesegmentDetailMarkers}
    />
  )
}
