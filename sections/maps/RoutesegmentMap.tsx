import { parseLatLngString } from '@shared/cms/components/keystaticComponents/MapPoint/parseLatLngString'
import type { CollectionEntry, InferEntrySchema } from 'astro:content'
import { Marker } from 'react-map-gl/maplibre'
import { RouteMap } from './RouteMap'

type Props = {
  geometry: InferEntrySchema<'routegeometry'>[]
  routesegments: CollectionEntry<'routesegments'>[]
  segmentFocusSlug?: string
  routesegmentDetails: CollectionEntry<'routesegmentdetails'>[]
}

export const RoutesegmentMap = ({
  geometry,
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
          className="flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-lg"
        >
          <div className="text-base font-extrabold">{detail?.data.position}</div>
        </Marker>
      )
    })
    .filter(Boolean)

  const focusSegemntId = routesegments.find((s) => s.slug === segmentFocusSlug)?.data.tsSlug

  return (
    <RouteMap
      geometry={geometry}
      routesegments={routesegments}
      focusSegemntId={focusSegemntId}
      routesegmentDetailMarkers={routesegmentDetailMarkers}
    />
  )
}
