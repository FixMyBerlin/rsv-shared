import { along, featureCollection, length, lineString } from '@turf/turf'
import type { CollectionEntry, InferEntrySchema } from 'astro:content'
import clsx from 'clsx'
import { useState } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import { BaseMap } from './BaseMap'
import { TipMarker } from './TipMarker'
import { getLinePaintRouteMap, routeSegmentStatus } from './statusDefinition'

type Props = {
  geometry: InferEntrySchema<'routegeometry'>[]
  routesegments: CollectionEntry<'routesegments'>[]
  focusSegemntId?: string
  routesegmentDetailMarkers?: React.ReactNode[]
}

export const RouteMap = ({
  geometry,
  routesegments,
  focusSegemntId,
  routesegmentDetailMarkers,
}: Props) => {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)

  const markers = geometry.map((segment) => {
    const midLine = lineString(segment.geometry.coordinates)
    const midLengthHalf = length(midLine) / 2
    const midPoint = along(midLine, midLengthHalf)
    const matchingSegment = routesegments.find(
      (s) => s.data.tsSlug === segment.properties.subsectionSlug,
    )
    const markerContent = (
      <div className="flex items-center gap-2 p-1">
        {segment.properties.status && (
          <div
            data-status={segment.properties.status}
            className={clsx(
              'flex size-6 flex-none items-center justify-center rounded-full',
              (focusSegemntId && focusSegemntId === segment.properties.subsectionSlug) ||
                !focusSegemntId
                ? routeSegmentStatus.get(segment.properties.status)?.colorClass
                : 'bg-gray-400',
            )}
          >
            <img
              src={routeSegmentStatus.get(segment.properties.status)?.icon.src}
              alt=""
              className="h-5 w-5"
            />
          </div>
        )}
        {segment.properties.subsectionSlug === selectedSegment && matchingSegment?.data.title && (
          <div
            className="flex max-w-60 flex-col items-start justify-center text-xs"
            data-subsectionSlug={segment.properties.subsectionSlug}
          >
            <p className="w-full truncate" title={matchingSegment?.data.title}>
              {matchingSegment?.data.title}
            </p>
            {segment.properties.estimatedCompletionDateString && (
              <p className="font-light">
                Fertig: {segment.properties.estimatedCompletionDateString.split('-')[1]}
              </p>
            )}
          </div>
        )}
      </div>
    )

    return (
      <Marker
        key={segment.properties.subsectionSlug}
        longitude={midPoint.geometry.coordinates[0] as number}
        latitude={midPoint.geometry.coordinates[1] as number}
        anchor="center"
        style={{ zIndex: segment.properties.subsectionSlug === selectedSegment ? 3 : 'unset' }}
        className="max-w-60"
      >
        <TipMarker
          anchor={matchingSegment?.data.markerPositionBottom ? 'bottom' : 'top'}
          onMouseEnter={() => setSelectedSegment(segment.properties.subsectionSlug)}
          onMouseLeave={() => setSelectedSegment(null)}
        >
          {focusSegemntId && focusSegemntId === segment.properties.subsectionSlug ? (
            markerContent
          ) : (
            <a href={`/route/${matchingSegment?.slug}`}>{markerContent}</a>
          )}
        </TipMarker>
      </Marker>
    )
  })

  const handleRouteClick = (id: string) => {
    const matchingSegment = routesegments.find((s) => s.data.tsSlug === id)
    // in case a segment is focused (Routesegmentmap) the focused segment should not be clickable
    if ((window && !focusSegemntId) || focusSegemntId !== id)
      window.location.href = `/route/${matchingSegment?.slug}`
  }

  return (
    <figure className="mt-12">
      <div className="h-[500px] w-full">
        <BaseMap
          setSelected={setSelectedSegment}
          markers={routesegmentDetailMarkers ? [...markers, ...routesegmentDetailMarkers] : markers}
          geometries={featureCollection(geometry)}
          focusSegment={focusSegemntId}
          handleRouteClick={handleRouteClick}
          linePaint={getLinePaintRouteMap(focusSegemntId)}
        />
      </div>
      <figcaption className="grid w-full grid-cols-3 gap-x-5 gap-y-3 bg-gray-200 px-3 py-2 sm:grid-cols-4 md:grid-cols-5">
        {Array.from(routeSegmentStatus).map(([status, { colorClass, icon, label }]) => (
          <div key={status} className="flex items-center gap-2">
            <div
              className={clsx(
                'flex size-6 flex-none items-center justify-center rounded-full',
                colorClass,
              )}
              aria-hidden={true}
            >
              <img src={icon.src} alt="" className="size-5" />
            </div>
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </figcaption>
    </figure>
  )
}
